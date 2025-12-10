"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { NavItem, sidebarSections } from "../../utils/sidebarSections";
import { Button } from "../ui/button";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/rbac";

interface SidebarProps {
  className?: string;
  activeItemId?: string | null;
  onSelect?: (item: NavItem) => void;
}

const itemHasActiveDescendant = (
  item: NavItem,
  targetId?: string | null
): boolean => {
  if (!targetId) {
    return false;
  }

  if (item.id === targetId) {
    return true;
  }

  return (
    item.children?.some((child) => itemHasActiveDescendant(child, targetId)) ??
    false
  );
};

const sectionContainsItem = (
  items: NavItem[],
  targetId?: string | null
): boolean => items.some((item) => itemHasActiveDescendant(item, targetId));

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  activeItemId = null,
  onSelect,
}) => {
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const prevActiveIdRef = React.useRef<string | null>(null);
  const [permissionsReady, setPermissionsReady] = React.useState(false);

  const handleToggle = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  React.useEffect(() => {
    if (!activeItemId) {
      prevActiveIdRef.current = null;
      return;
    }

    if (prevActiveIdRef.current === activeItemId) {
      return;
    }

    prevActiveIdRef.current = activeItemId;

    const sectionWithActive = sidebarSections.find((section) =>
      sectionContainsItem(section.items, activeItemId)
    );

    if (sectionWithActive) {
      setOpenSection(sectionWithActive.title);
    }
  }, [activeItemId]);

  React.useEffect(() => {
    // Ensure permission checks run only on client to avoid hydration mismatch
    setPermissionsReady(true);
  }, []);

  if (!permissionsReady) {
    // Avoid SSR/client mismatch; render nothing until permissions can be read
    return null;
  }

  return (
    <aside
      className={`flex h-full w-72 flex-col border border-slate-100 bg-white ${className ?? ""}`}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {sidebarSections
          .filter((section) => {
            // If section has permission, check it
            if (section.permission || section.permissions) {
              if (section.permission) {
                return hasPermission(section.permission);
              } else if (section.permissions) {
                if (section.requireAll) {
                  return hasAllPermissions(section.permissions);
                } else {
                  return hasAnyPermission(section.permissions);
                }
              }
              return false;
            }
            // No permission required, show always
            return true;
          })
          .map((section) => {
            const isSectionOpen = openSection === section.title;
            return (
              <div key={section.title} className="space-y-2 ">
                <SectionHeader
                  title={section.title}
                  icon={section.icon}
                  isOpen={isSectionOpen}
                  onToggle={() => handleToggle(section.title)}
                />
              {isSectionOpen && (
                <nav className="ml-3 border-l border-slate-200 pl-4 ease-in-out">
                  <div className="space-y-1 transition-all duration-300">
                    {section.items.map((item) => {
                      // Filter items based on permissions
                      if (item.permission || item.permissions) {
                        // Check permission synchronously
                        let hasAccess = false;
                        if (item.permission) {
                          hasAccess = hasPermission(item.permission);
                        } else if (item.permissions) {
                          if (item.requireAll) {
                            hasAccess = hasAllPermissions(item.permissions);
                          } else {
                            hasAccess = hasAnyPermission(item.permissions);
                          }
                        }
                        
                        // Only render if user has access
                        if (!hasAccess) {
                          return null;
                        }
                      }
                      
                      // Render the item
                      return (
                        <SidebarLink
                          key={item.id}
                          item={item}
                          activeItemId={activeItemId}
                          onSelect={onSelect}
                        />
                      );
                    })}
                  </div>
                </nav>
              )}
            </div>
          );
          })}
      </div>
    </aside>
  );
};

const SectionHeader: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen?: boolean;
  onToggle: () => void;
}> = ({ title, icon: Icon, isOpen, onToggle }) => (
  <Button
    type="button"
    onClick={onToggle}
    variant="ghost"
    className="flex w-full items-center justify-between  px-3 py-2 text-start text-s  text-neutral-600 transition hover:bg-slate-50 "
    aria-expanded={isOpen}
  >
    <span className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-slate-400" />
      <span>{title}</span>
    </span>
    <ChevronDown
      className={`h-4 w-4 transition duration-200 ${isOpen ? "rotate-180" : ""}`}
    />
  </Button>
);

type SidebarSelectionHandler = (item: NavItem) => void;

function SidebarLink({
  item,
  activeItemId,
  onSelect,
}: {
  item: NavItem;
  activeItemId?: string | null;
  onSelect?: SidebarSelectionHandler;
}) {
  const baseClasses =
    "group flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200";
  const isActive = item.id === activeItemId || item.active;
  const activeClasses = isActive
    ? "bg-white text-black scale-110 md:w-50"
    : "hover:bg-slate-100 hover:text-slate-800 md:w-50";

  if (item.children?.length) {
    return (
      <SidebarGroup
        item={item}
        activeItemId={activeItemId}
        onSelect={onSelect}
      />
    );
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(item);
    }
  };

  if (item.componentKey) {
    return (
      <Button
        type="button"
        onClick={handleSelect}
        variant="ghost"
        className={`${baseClasses} ${activeClasses}`}
        aria-pressed={isActive}
      >
        <span>{item.label}</span>
      </Button>
    );
  }

  if (!item.href) {
    return (
      <div className={`${baseClasses} ${activeClasses}`}>
        <span>{item.label}</span>
      </div>
    );
  }

  return (
    <Link href={item.href} className={`${baseClasses} ${activeClasses}`}>
      <span>{item.label}</span>
      <ChevronRight
        className={`h-4 w-4 ${
          isActive
            ? "text-blue-500"
            : "text-slate-300 group-hover:text-slate-500"
        }`}
      />
    </Link>
  );
}

function SidebarGroup({
  item,
  activeItemId,
  onSelect,
}: {
  item: NavItem;
  activeItemId?: string | null;
  onSelect?: SidebarSelectionHandler;
}) {
  const hasActiveChild = React.useMemo(
    () => itemHasActiveDescendant(item, activeItemId),
    [item, activeItemId]
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const hasUserToggledRef = React.useRef(false);
  const isFirstRenderRef = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (hasActiveChild) {
        setIsOpen(true);
      }
      return;
    }

    if (!hasUserToggledRef.current && hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  const baseClasses =
    "group flex items-center justify-between  px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200";

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          hasUserToggledRef.current = true;
          setIsOpen((prev) => !prev);
        }}
        className={`${baseClasses} bg-gray-50 text-slate-500`}
        aria-expanded={isOpen}
      >
        <span>{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>
      {isOpen && (
        <div className="ml-3 border-l border-slate-200 pl-3">
          {item.children?.map((child) => {
            // Filter children based on permissions
            if (child.permission || child.permissions) {
              // Check permission synchronously
              let hasAccess = false;
              if (child.permission) {
                hasAccess = hasPermission(child.permission);
              } else if (child.permissions) {
                if (child.requireAll) {
                  hasAccess = hasAllPermissions(child.permissions);
                } else {
                  hasAccess = hasAnyPermission(child.permissions);
                }
              }
              
              // Only render if user has access
              if (!hasAccess) {
                return null;
              }
            }
            
            // Render the child
            return (
              <SidebarLink
                key={child.id}
                item={child}
                activeItemId={activeItemId}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}