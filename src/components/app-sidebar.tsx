import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  GraduationCap,
  CalendarDays,
  BarChart3,
  Trophy,
  Award,
  User,
  Settings,
  LogOut,
  ListChecks,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const learn = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Tutor", url: "/ai-tutor", icon: Sparkles },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Lessons", url: "/lessons", icon: GraduationCap },
  { title: "Quizzes", url: "/quizzes", icon: ListChecks },
  { title: "Study Planner", url: "/planner", icon: CalendarDays },
];

const progress = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { title: "Achievements", url: "/achievements", icon: Award },
];

const account = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url;

  const renderGroup = (label: string, items: typeof learn) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="py-2">
        {renderGroup("Learn", learn)}
        {renderGroup("Progress", progress)}
        {renderGroup("Account", account)}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
