"use client";

import Logo from "@/components/Logo";
import { RemoveScroll } from "react-remove-scroll";
import ThemeButton from "@/components/ThemeButton";
import NavLink from "@/components/NavLink";
import Button from "@/components/Button";
import Dropdown from "./Dropdown";
import { useSession } from "next-auth/react";

import { navigation, adminNavigation, type NavItem } from "@/contstants/navigation";

type SidebarProps = {
    visibleSidebar?: boolean;
    hideSidebar?: boolean;
    onCloseSidebar?: () => void;
};

const Sidebar = ({
    visibleSidebar,
    hideSidebar,
    onCloseSidebar,
}: SidebarProps) => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "SUPER_ADMIN";
    const isVendor = session?.user?.role === "OWNER" || session?.user?.role === "ADMIN";

    return (
        <div
            className={`fixed top-0 left-0 bottom-0 flex flex-col w-85 p-5 bg-b-surface1 transition-transform duration-300 max-4xl:w-70 max-3xl:w-60 max-xl:w-74 max-md:p-3 ${visibleSidebar
                ? `${hideSidebar
                    ? "z-40 translate-x-0"
                    : "max-xl:z-40 max-xl:translate-x-0"
                }`
                : `${hideSidebar
                    ? "z-40 -translate-x-full"
                    : "max-xl:z-40 max-xl:-translate-x-full"
                }`
                }`}
        >
            <Logo className="mb-5" />
            <Button
                className={`group absolute top-5 right-5 max-md:top-3 max-md:right-3 ${hideSidebar ? "flex" : "!hidden max-xl:!flex"
                    }`}
                icon="close"
                onClick={onCloseSidebar}
                isCircle
                isWhite
            />
            <RemoveScroll
                className="flex flex-col gap-1 grow overflow-auto -mx-5 px-5 scrollbar scrollbar-thumb-t-tertiary/50 scrollbar-track-b-surface2 max-md:-mx-3 max-md:px-3"
                enabled={visibleSidebar}
            >
                {navigation
                    .filter((item) => {
                        if (isAdmin) {
                            return ["Home", "Docs"].includes(item.title);
                        }
                        if (isVendor) {
                            // Vendors see everything except "My Quotes" and "Admin"
                            return item.title !== "My Quotes";
                        }
                        // Default for consumers/guests (no NextAuth session)
                        return ["Home", "Docs", "My Quotes"].includes(item.title);
                    })
                    .map((item) =>
                        item.href ? (
                            <NavLink
                                key={item.title}
                                value={{
                                    href: item.href,
                                    title: item.title,
                                    icon: item.icon,
                                    counter: item.counter,
                                }}
                            />
                        ) : (
                            <Dropdown
                                key={item.title}
                                value={{
                                    title: item.title,
                                    icon: item.icon,
                                    href: item.href,
                                    list: item.list,
                                }}
                            />
                        )
                    )}

                {isAdmin && (
                    <div className="mt-4 pt-4 border-t border-s-subtle">
                        {adminNavigation.map((item: NavItem) =>
                            item.href ? (
                                <NavLink
                                    key={item.title}
                                    value={{
                                        href: item.href,
                                        title: item.title,
                                        icon: item.icon,
                                        counter: item.counter,
                                    }}
                                />
                            ) : (
                                <Dropdown
                                    key={item.title}
                                    value={{
                                        title: item.title,
                                        icon: item.icon,
                                        href: item.href,
                                        list: item.list,
                                    }}
                                />
                            )
                        )}
                    </div>
                )}


            </RemoveScroll>
            <div className="mt-auto pt-6 max-md:pt-4">
                <ThemeButton
                    className={`${hideSidebar ? "hidden max-lg:block" : ""}`}
                />
            </div>
        </div>
    );
};

export default Sidebar;

