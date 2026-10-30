/**
 * PostizMetro REVIEW ONLY gate.
 * In review mode (POSTIZMETRO_REVIEW_MODE=true) it returns 410 for routes
 * that must not be usable from the public review UI: Postiz login/register
 * (AuthController), billing, and marketplace. Integration OAuth connect is
 * NOT gated here; it lives in IntegrationsController, not AuthController.
 * REMOVE AT MERGE: delete this file and its use in api.module.ts.
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ReviewGateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (process.env.POSTIZMETRO_REVIEW_MODE === 'true') {
      res.status(410).json({
        message:
          'Disabled in PostizMetro review build. Auth, billing and marketplace are restored at merge with the main app.',
      });
      return;
    }
    next();
  }
}
