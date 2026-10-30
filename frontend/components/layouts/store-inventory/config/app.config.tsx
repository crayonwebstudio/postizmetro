import {
  BarChart3,
  Bot,
  Calendar,
  Image,
  Layers,
  LayoutGrid,
  Link2,
  MessageCircle,
  Plug,
  Repeat,
  Rocket,
  Settings2,
  Share2,
  ShoppingBag,
  Webhook,
} from 'lucide-react';
import { MenuConfig } from './types';

// PostizMetro menu, replacing the Metronic store-inventory demo menu.
// Order follows the PostizMetro brief: Launches, Calendar, Media,
// Integrations, Analytics, Agents, Autopost, Sets, Plugs, Marketplace,
// Messages, Third-party, Webhooks, Settings. No auth pages.
export const MENU_SIDEBAR: MenuConfig = [
  { heading: 'PostizMetro' },
  { title: 'Launches', icon: Rocket, path: '/launches' },
  { title: 'Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Composer', icon: LayoutGrid, path: '/composer' },
  { title: 'Media', icon: Image, path: '/media' },
  { title: 'Integrations', icon: Share2, path: '/integrations' },
  { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  { heading: 'Automation' },
  { title: 'Agents', icon: Bot, path: '/agents' },
  { title: 'Autopost', icon: Repeat, path: '/autopost' },
  { title: 'Sets', icon: Layers, path: '/sets' },
  { title: 'Plugs', icon: Plug, path: '/plugs' },
  { title: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
  { title: 'Messages', icon: MessageCircle, path: '/messages' },
  { title: 'Third-party', icon: Link2, path: '/third-party' },
  { title: 'Webhooks', icon: Webhook, path: '/webhooks' },
  { title: 'Settings', icon: Settings2, path: '/settings' },
];
