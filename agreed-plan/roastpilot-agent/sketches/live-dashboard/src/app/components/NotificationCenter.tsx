import { Bell, X, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "warning" | "success";
  read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({ notifications, onMarkAsRead, onClearAll }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const colorMap = {
    info: "text-[--color-roast-nominal]",
    warning: "text-[--color-roast-caution]",
    success: "text-[--color-roast-nominal]",
  };

  return (
    <div className="fixed top-20 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-card border border-border rounded-lg shadow-lg p-3 hover:bg-muted transition-colors group"
          title="Open notifications"
        >
          <Bell size={24} className="text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-[--color-roast-fault] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-mono">
              {unreadCount}
            </div>
          )}
          <div className="absolute -bottom-8 right-0 bg-card border border-border rounded px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Click to expand
          </div>
        </button>
      ) : (
        <div className="bg-card border border-border rounded-lg shadow-lg w-96 max-h-[500px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-white" />
              <h3 className="font-mono uppercase text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-[--color-roast-fault] text-white text-xs rounded-full px-2 py-0.5 font-mono">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Collapse to icon"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-sm">
                No notifications
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => {
                  const Icon = iconMap[notification.type];
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        notification.read
                          ? "bg-background border-border"
                          : "bg-card border-border shadow-sm"
                      }`}
                      onClick={() => !notification.read && onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon size={18} className={`mt-0.5 flex-shrink-0 ${colorMap[notification.type]}`} />
                        <div className="flex-1">
                          <p className={`text-sm ${notification.read ? "text-zinc-400" : "text-white"}`}>
                            {notification.message}
                          </p>
                          <span className="text-xs text-zinc-500 font-mono mt-1 block">
                            {notification.timestamp}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[--color-roast-nominal] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
