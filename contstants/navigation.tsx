export const navigation = [
    {
        title: "Home",
        icon: "dashboard",
        href: "/",
    },
    {
        title: "RFQs",
        icon: "product-think",
        list: [
            {
                title: "All",
                href: "/rfqs",
            },
            {
                title: "Pending",
                href: "/rfqs?status=PENDING",
            },
            {
                title: "Quoted",
                href: "/rfqs?status=QUOTED",
            },
            {
                title: "Accepted",
                href: "/rfqs?status=ACCEPTED",
            },
            {
                title: "Closed",
                href: "/rfqs?status=CLOSED",
            },
        ],
    },
    {
        title: "Customers",
        icon: "profile",
        href: "/customers",
    },
    {
        title: "Discounts",
        icon: "barcode",
        href: "/discounts",
    },
    {
        title: "Shipping",
        icon: "wallet",
        href: "/shipping",
    },
    {
        title: "Settings",
        icon: "edit-profile",
        href: "/settings",
    },
    {
        title: "My Quotes",
        icon: "document",
        href: "/consumer/rfqs",
    },
    {
        title: "Docs",
        icon: "info",
        href: "/docs",
    },
];


export const adminNavigation = [
    {
        title: "Admin",
        icon: "lock",
        list: [
            {
                title: "Stores",
                href: "/admin/stores",
            },
            {
                title: "All RFQs",
                href: "/admin/rfqs",
            },
        ],
    },
];

export const navigationUser = [];

