import type { LocaleCode } from './locales';

export interface SiteChrome {
  cta: string;
  status: string;
  mainNav: string;
  openMenu: string;
  closeMenu: string;
  home: string;
  nav: [string, string, string, string];
}

const SITE_CHROME: Record<LocaleCode, SiteChrome> = {
  'zh-CN': {
    cta: '询价',
    status: '可接单 Q3',
    mainNav: '主导航',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    home: '首页',
    nav: ['数字', '能力', '产品', '流程'],
  },
  en: {
    cta: 'Enquire',
    status: 'AVAILABLE Q3',
    mainNav: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    home: 'Home',
    nav: ['Numbers', 'Capability', 'Parts', 'Process'],
  },
  ar: {
    cta: 'استفسار',
    status: 'متاح الربع الثالث',
    mainNav: 'التنقل الرئيسي',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    home: 'الرئيسية',
    nav: ['الأرقام', 'القدرات', 'المنتجات', 'العملية'],
  },
  tr: {
    cta: 'Teklif al',
    status: '3. ÇEYREK MÜSAİT',
    mainNav: 'Ana gezinme',
    openMenu: 'Menüyü aç',
    closeMenu: 'Menüyü kapat',
    home: 'Ana sayfa',
    nav: ['Sayılar', 'Yetenekler', 'Ürünler', 'Süreç'],
  },
  he: {
    cta: 'לבקשת הצעה',
    status: 'פנוי ברבעון 3',
    mainNav: 'ניווט ראשי',
    openMenu: 'פתיחת תפריט',
    closeMenu: 'סגירת תפריט',
    home: 'דף הבית',
    nav: ['מספרים', 'יכולות', 'מוצרים', 'תהליך'],
  },
  fa: {
    cta: 'استعلام قیمت',
    status: 'ظرفیت سه‌ماهه سوم',
    mainNav: 'ناوبری اصلی',
    openMenu: 'باز کردن منو',
    closeMenu: 'بستن منو',
    home: 'خانه',
    nav: ['اعداد', 'توانمندی‌ها', 'محصولات', 'فرایند'],
  },
  ur: {
    cta: 'قیمت معلوم کریں',
    status: 'تیسری سہ ماہی دستیاب',
    mainNav: 'مرکزی نیویگیشن',
    openMenu: 'مینو کھولیں',
    closeMenu: 'مینو بند کریں',
    home: 'ہوم',
    nav: ['اعداد', 'صلاحیتیں', 'مصنوعات', 'عمل'],
  },
};

export function siteChrome(locale?: LocaleCode): SiteChrome {
  return SITE_CHROME[locale ?? 'zh-CN'];
}
