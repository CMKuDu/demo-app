// Add these constants at the top of the file after imports
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;
export const DAYS_IN_WEEK = 7;
export const MILLISECONDS = 1000;

export const REFRESH_TOKEN_EXPIRY =
    DAYS_IN_WEEK *
    HOURS_IN_DAY *
    MINUTES_IN_HOUR *
    SECONDS_IN_MINUTE *
    MILLISECONDS;

export const DEFAULT_SYSTEM_CONFIG = {
    maintenanceMode: false,
    logo: '',
    name: '',
    version: '1.0.0',
    linkWebsite: '',
    linkSupport: '',
    supportEmail: '',
    minWithdraw: 0,
    maxWithdraw: 500000000,
    customFields: JSON.stringify({
        bonusF0: 0,
        bonusF1: 0,
        bonusF2: 0,
    }),
};

export const COOKIE_KEY = {
    REFRESH_TOKEN: 'refresh_token',
    ACCESS_TOKEN: 'access_token',
};

export const PERMISSIONS_KEY = {
    article: {
        view_articles: {
            name: 'view_articles',
            desc: 'Xem danh sách bài viết',
            groupName: 'article',
        },
        view_detail_article: {
            name: 'view_detail_article',
            desc: 'Xem chi tiết bài viết',
            groupName: 'article',
        },
        create_article: {
            name: 'create_article',
            desc: 'Tạo bài viết',
            groupName: 'article',
        },
        edit_article: {
            name: 'edit_article',
            desc: 'Chỉnh sửa bài viết',
            groupName: 'article',
        },
        delete_article: {
            name: 'delete_article',
            desc: 'Xóa bài viết',
            groupName: 'article',
        },
    },
    category: {
        view_categories: {
            name: 'view_categories',
            desc: 'Xem danh sách danh mục',
            groupName: 'category',
        },
        view_detail_category: {
            name: 'view_detail_category',
            desc: 'Xem chi tiết danh mục',
            groupName: 'category',
        },
        create_category: {
            name: 'create_category',
            desc: 'Tạo danh mục',
            groupName: 'category',
        },
        edit_category: {
            name: 'edit_category',
            desc: 'Chỉnh sửa danh mục',
            groupName: 'category',
        },
        delete_category: {
            name: 'delete_category',
            desc: 'Xóa danh mục',
            groupName: 'category',
        },
    },
    permission: {
        view_permissions: {
            name: 'view_permissions',
            desc: 'Xem danh sách quyền',
            groupName: 'permission',
        },
        create_permissions: {
            name: 'create_permissions',
            desc: 'Tạo quyền',
            groupName: 'permission',
        },
        refresh_permissions: {
            name: 'refresh_permissions',
            desc: 'Làm mới quyền',
            groupName: 'permission',
        },
    },
    product: {
        view_products: {
            name: 'view_products',
            desc: 'Xem danh sách sản phẩm',
            groupName: 'product',
        },
        view_detail_product: {
            name: 'view_detail_product',
            desc: 'Xem chi tiết sản phẩm',
            groupName: 'product',
        },
        create_product: {
            name: 'create_product',
            desc: 'Tạo sản phẩm',
            groupName: 'product',
        },
        edit_product: {
            name: 'edit_product',
            desc: 'Chỉnh sửa sản phẩm',
            groupName: 'product',
        },
        delete_product: {
            name: 'delete_product',
            desc: 'Xóa sản phẩm',
            groupName: 'product',
        },
    },
    role: {
        view_roles: {
            name: 'view_roles',
            desc: 'Xem danh sách vai trò',
            groupName: 'role',
        },
        view_detail_role: {
            name: 'view_detail_role',
            desc: 'Xem chi tiết vai trò',
            groupName: 'role',
        },
        create_role: {
            name: 'create_role',
            desc: 'Tạo vai trò',
            groupName: 'role',
        },
        // add_role_user: {
        //     name: 'add_role_user',
        //     desc: 'Thêm vai trò cho người dùng',
        //     groupName: 'role',
        // },
        create_role_permission: {
            name: 'create_role_permission',
            desc: 'Tạo quyền cho vai trò',
            groupName: 'role',
        },
        update_role_permission: {
            name: 'update_role_permission',
            desc: 'Cập nhật quyền cho vai trò',
            groupName: 'role',
        },
        // edit_role: {
        //     name: 'edit_role',
        //     desc: 'Chỉnh sửa vai trò',
        //     groupName: 'role',
        // },
        delete_role: {
            name: 'delete_role',
            desc: 'Xóa vai trò',
            groupName: 'role',
        },
    },
    systemConfig: {
        view_system_config: {
            name: 'view_system_config',
            desc: 'Xem cấu hình hệ thống',
            groupName: 'systemConfig',
        },
        edit_system_config: {
            name: 'edit_system_config',
            desc: 'Chỉnh sửa cấu hình hệ thống',
            groupName: 'systemConfig',
        },
    },
    systemUser: {
        view_system_users: {
            name: 'view_system_users',
            desc: 'Xem danh sách người dùng hệ thống',
            groupName: 'systemUser',
        },
        create_system_user: {
            name: 'create_system_user',
            desc: 'Tạo người dùng hệ thống',
            groupName: 'systemUser',
        },
        update_system_user: {
            name: 'update_system_user',
            desc: 'Cập nhật người dùng hệ thống',
            groupName: 'systemUser',
        },
        delete_system_user: {
            name: 'delete_system_user',
            desc: 'Xóa người dùng hệ thống',
            groupName: 'systemUser',
        },
    },
    transaction: {
        view_transactions: {
            name: 'view_transactions',
            desc: 'Xem danh sách giao dịch',
            groupName: 'transaction',
        },
        approve_transaction: {
            name: 'approve_transaction',
            desc: 'Duyệt giao dịch',
            groupName: 'transaction',
        },
        reject_transaction: {
            name: 'reject_transaction',
            desc: 'Từ chối giao dịch',
            groupName: 'transaction',
        },
    },
    user: {
        view_users: {
            name: 'view_users',
            desc: 'Xem danh sách người dùng',
            groupName: 'user',
        },
        create_user: {
            name: 'create_user',
            desc: 'Tạo người dùng',
            groupName: 'user',
        },
        banned_user: {
            name: 'banned_user',
            desc: 'Cấm người dùng',
            groupName: 'user',
        },
        view_detail_user: {
            name: 'view_detail_user',
            desc: 'Xem chi tiết người dùng',
            groupName: 'user',
        },
        edit_user: {
            name: 'edit_user',
            desc: 'Chỉnh sửa người dùng',
            groupName: 'user',
        },
        delete_user: {
            name: 'delete_user',
            desc: 'Xóa người dùng',
            groupName: 'user',
        },
    },
    voucher: {
        view_vouchers: {
            name: 'view_vouchers',
            desc: 'Xem danh sách voucher',
            groupName: 'voucher',
        },
        view_detail_voucher: {
            name: 'view_detail_voucher',
            desc: 'Xem chi tiết voucher',
            groupName: 'voucher',
        },
        create_voucher: {
            name: 'create_voucher',
            desc: 'Tạo voucher',
            groupName: 'voucher',
        },
        edit_voucher: {
            name: 'edit_voucher',
            desc: 'Chỉnh sửa voucher',
            groupName: 'voucher',
        },
        delete_voucher: {
            name: 'delete_voucher',
            desc: 'Xóa voucher',
            groupName: 'voucher',
        },
    },
    wallet: {
        update_wallet: {
            name: 'update_wallets',
            desc: 'Cập nhật ví',
            groupName: 'wallet',
        },
    },
    bank: {
        view_banks: {
            name: 'view_banks',
            desc: 'Xem danh sách ngân hàng',
            groupName: 'bank',
        },
    },
    systemErrorLog: {
        view_logs: {
            name: 'view_logs',
            desc: 'Xem danh sách logs lỗi hệ thống',
            groupName: 'systemErrorLog',
        },
        view_log_detail: {
            name: 'view_log_detail',
            desc: 'Xem chi tiết log lỗi',
            groupName: 'systemErrorLog',
        },
        clear_logs: {
            name: 'clear_logs',
            desc: 'Xóa logs lỗi cũ',
            groupName: 'systemErrorLog',
        },
    },
    chatCSKH: {
        chat_cskh_management: {
            name: 'chat_cskh_management',
            desc: 'Quản lý chat CSKH',
            groupName: 'chatCSKH',
        },
    },
};
