/**
 * PostizMetro REVIEW ONLY middleware.
 * Replaces AuthMiddleware for the interim public review build only.
 * It loads ONE fixed user/organisation from env (POSTIZMETRO_REVIEW_USER_ID,
 * optional POSTIZMETRO_REVIEW_ORG_ID) and sets req.user / req.org in the same
 * shape AuthMiddleware sets them, so GetOrgFromRequest() and
 * GetUserFromRequest() keep working and PoliciesGuard can run.
 * REMOVE AT MERGE: when milan provides his existing repo, delete this file,
 * restore AuthMiddleware in api.module.ts, and remove the review bypass in
 * permissions.guard.ts. Do NOT merge this file into his repo.
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { HttpForbiddenException } from '@gitroom/nestjs-libraries/services/exception.filter';

@Injectable()
export class PublicWorkspaceMiddleware implements NestMiddleware {
  constructor(
    private _organizationService: OrganizationService,
    private _userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = process.env.POSTIZMETRO_REVIEW_USER_ID;
    if (!userId) {
      throw new HttpForbiddenException();
    }
    try {
      const user: any = await this._userService.getUserById(userId);
      if (!user || !user.activated) {
        throw new HttpForbiddenException();
      }
      delete user.password;
      const organizations: any[] =
        await this._organizationService.getOrgsByUserId(user.id);
      const setOrg =
        organizations.find(
          (org) => org.id === process.env.POSTIZMETRO_REVIEW_ORG_ID,
        ) || organizations[0];
      if (!setOrg) {
        throw new HttpForbiddenException();
      }
      if (!setOrg.apiKey) {
        await this._organizationService.updateApiKey(setOrg.id);
      }
      (req as any).user = user;
      (req as any).org = setOrg;
      next();
    } catch (err) {
      throw new HttpForbiddenException();
    }
  }
}
