import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Tags,
  FolderOpen,
  Settings,
  LogOut,
  Newspaper,
  PenLine,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "./theme-toggle";

const mainNavItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/articles", label: "Mes articles", icon: FileText },
  { href: "/dashboard/nouveau", label: "Nouvel article", icon: PenLine },
  { href: "/dashboard/discussions", label: "Discussions", icon: MessageSquare },
];

const adminNavItems = [
  { href: "/dashboard/tous-les-articles", label: "Tous les articles", icon: FolderOpen },
  { href: "/dashboard/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/dashboard/categories", label: "Catégories", icon: Tags },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-sidebar-primary" />
          <span className="font-serif font-bold text-lg">Le Journal</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                  >
                    <Link href={item.href} data-testid={`link-sidebar-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.href}
                    >
                      <Link href={item.href} data-testid={`link-sidebar-admin-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium" data-testid="text-sidebar-username">
                {user?.displayName}
              </span>
              <span className="text-xs text-sidebar-foreground/70" data-testid="text-sidebar-role">
                {user?.role === "admin" ? "Administrateur" : "Rédacteur"}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} data-testid="button-sidebar-logout">
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
