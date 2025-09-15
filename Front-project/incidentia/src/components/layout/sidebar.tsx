"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Home,
  Ticket,
  Users,
  Settings,
  BarChart3,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Sidebar({
  activeSection = "dashboard",
  onSectionChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tickets", label: "Tickets", icon: Ticket, badge: "12" },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "reports", label: "Reportes", icon: BarChart3 },
    { id: "notifications", label: "Notificaciones", icon: Bell, badge: "3" },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  return (
    <>
      {/* Botón hamburguesa solo visible en móvil */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 sm:hidden z-50"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed sm:static top-0 left-0 h-full z-50
          bg-background border-r flex flex-col transition-all duration-300
          ${isCollapsed ? "w-16" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        {/* Logo/Header */}
        <div
          className={`p-6 border-b flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-foreground">IT Support</h2>
              <p className="text-sm text-muted-foreground">
                Sistema de Tickets
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-full"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <Button
            size="sm"
            className={`w-full flex items-center justify-center ${
              isCollapsed ? "px-0" : ""
            }`}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Nuevo Ticket</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full ${
                  isCollapsed ? "justify-center px-2" : "justify-start"
                }`}
                onClick={() => {
                  onSectionChange?.(item.id);
                  setIsOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 ${!isCollapsed ? "mr-3" : ""}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Stats Card */}
        {!isCollapsed && (
          <div className="p-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resumen Hoy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nuevos:</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resueltos:</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendientes:</span>
                  <span className="font-medium">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </aside>
    </>
  );
}
