"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
    { name: "Events", href: "events" },
    { name: "Services", href: "services" },
    { name: "Assign Access", href: "access" },
    { name: "Feedback", href: "feedback" },
    { name: "Media", href: "media" },
    { name: "Content", href: "content" },
];

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const pathSegments = pathname.split("/");
    
    // Find which tab segment we're currently on
    const currentTabIndex = pathSegments.findIndex(segment => 
        tabs.some(tab => tab.href === segment)
    );
    
    // Create the base path by removing everything after the tab segment
    const basePath = currentTabIndex !== -1 
        ? pathSegments.slice(0, currentTabIndex).join("/")
        : pathSegments.join("/");

    return (
        <div className="min-h-screen text-white bg-background">
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map((tab) => {
                        // Replace the current tab with the new tab, or append if no tab exists
                        const tabHref = currentTabIndex !== -1 
                            ? `${basePath}/${tab.href}`
                            : `${pathname}/${tab.href}`;
                        
                        const isActive = pathSegments.includes(tab.href);
                        return (
                            <Link
                                key={tab.name}
                                href={tabHref}
                                prefetch={false}
                                className={`
                                    relative px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${isActive ? "text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="admin-tab"
                                        className="absolute inset-0 bg-blue-600 rounded-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-lg -z-10" />
                                )}
                                <span className="relative z-10">{tab.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Page Content */}
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-black/20 backdrop-blur-sm min-h-[600px] shadow-sm dark:shadow-none">
                    {children}
                </div>
            </div>
        </div>
    );
}