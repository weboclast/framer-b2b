"use client";

import { Element } from "react-scroll";
import Layout from "@/components/Layout";
import Menu from "./Menu";
import ProfileInformation from "./ProfileInformation";
import StoreSettings from "./YourShop";
import Password from "./Password";
import EmailSettings from "./EmailSettings";

const ElementWithOffset = ({
    className,
    name,
    children,
}: {
    className?: string;
    name: string;
    children: React.ReactNode;
}) => {
    return (
        <div className="relative">
            <Element
                className={`absolute -top-21 left-0 right-0 ${className || ""}`}
                name={name}
            ></Element>
            {children}
        </div>
    );
};

const SettingsPage = () => {
    const navigation = [
        {
            title: "Store",
            icon: "bag",
            description: "Store name, currency, tax & Store ID",
            to: "store-settings",
        },
        {
            title: "Security",
            icon: "lock",
            description: "Change password",
            to: "security",
        },
        {
            title: "Email & Templates",
            icon: "envelope",
            description: "Sender config & email templates",
            to: "email-settings",
        },
    ];

    return (
        <Layout title="Settings">
            <div className="flex items-start max-lg:block">
                <Menu
                    profileInformationTo="profile-information"
                    items={navigation}
                />
                <div className="flex flex-col gap-3 w-[calc(100%-30rem)] pl-3 max-3xl:w-[calc(100%-25rem)] max-2xl:w-[calc(100%-18.5rem)] max-lg:w-full max-lg:pl-0">
                    <ElementWithOffset
                        className="-top-22"
                        name="profile-information"
                    >
                        <ProfileInformation />
                    </ElementWithOffset>
                    <ElementWithOffset name="store-settings">
                        <StoreSettings />
                    </ElementWithOffset>
                    <ElementWithOffset name="security">
                        <Password />
                    </ElementWithOffset>
                    <ElementWithOffset name="email-settings">
                        <EmailSettings />
                    </ElementWithOffset>
                </div>
            </div>
        </Layout>
    );
};

export default SettingsPage;

