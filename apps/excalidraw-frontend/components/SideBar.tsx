"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import {
    Menu as MenuIcon,
    File as OpenIcon,
    Download as SaveIcon,
    Image as ExportImageIcon,
    Users as LiveCollaborationIcon,
    Zap as CommandPaletteIcon,
    Search as FindOnCanvasIcon,
    HelpCircle as HelpIcon,
    Trash as ResetCanvasIcon,
    X as ExcalidrawPlusIcon,
    Github as GitHubIcon,
    Twitter as FollowUsIcon,
    LogIn as SignUpIcon,
    Sun as LightThemeIcon,
    Moon as DarkThemeIcon,
    Computer as SystemThemeIcon,
} from "lucide-react";
interface SideBarProps {
  onCanvasBackgroundChange?: (color: string) => void;
}
export function SideBar({onCanvasBackgroundChange}:SideBarProps) {
    const session = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuButtonRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Menu Trigger Button */}
            <div
                ref={menuButtonRef}
                className="dropdown-menu-button"
                style={{
                    position: "fixed",
                    top: "10px",
                    left: "10px",
                    zIndex: 100,
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "4px",
                    background: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onClick={toggleOpen}
            >
                <MenuIcon size={20} />
            </div>

            {/* Menu Overlay */}
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: (menuButtonRef.current as any)?.offsetTop + 40 || "50px",
                        left: "10px",
                        zIndex: 100,
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        width: "280px",
                        padding: "12px 0",
                        animation: "slideIn 0.2s ease-out",
                    }}
                >
                    <div style={{ padding: "0 12px" }}>
                        {/* Canvas Section */}
                        <SectionHeader label="Canvas" />
                        
                        <MenuItem icon={<SaveIcon size={16} />} label="Save to..." />
                        <MenuItem icon={<ExportImageIcon size={16} />} label="Export image..." />
                        <MenuItem icon={<LiveCollaborationIcon size={16} />} label="Live collaboration..." />
                        
                        {/* Tools Section */}
                        <SectionHeader label="Tools" />
                      
                        
                        <MenuItem icon={<ResetCanvasIcon size={16} />} label="Reset the canvas" />
                    </div>

                    <Divider />

                    <div style={{ padding: "0 12px" }}>
                        <MenuItem icon={<ExcalidrawPlusIcon size={16} />} label="Excalidraw+" />
                   
                    </div>

                    <Divider />

                    <div style={{ padding: "0 12px" }}>
                        <SectionHeader label="Account" />
                        {session.status === 'authenticated' ? (
                            <MenuItem label="Log out" onClick={() => signOut({ callbackUrl: "/" })} />
                        ) : (
                            <MenuItem label="Sign up" onClick={() => signIn()} icon={<SignUpIcon size={16} />} />
                        )}
                    </div>

                    <Divider />

                    <div style={{ padding: "0 12px" }}>
                        <SectionHeader label="Theme" />
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            <ThemeButton icon={<LightThemeIcon size={16} />} label="Light" />
                            <ThemeButton icon={<DarkThemeIcon size={16} />} label="Dark" />
                        </div>

                        <SectionHeader label="Canvas background" />
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "4px",
                            marginBottom: "8px"
                        }}>
                            {["#ffffff", "#f0f0f0", "#e0e0e0", "#faffda", "#d4edda", "#f8d7da", "#e7e9fd"].map((color) => (
                                <div
                                    key={color}
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        backgroundColor: color,
                                        borderRadius: "4px",
                                        border: "1px solid #ddd",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => onCanvasBackgroundChange?.(color)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}


interface MenuItemProps {
    icon?: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick?: () => void;
}
// New components
function SectionHeader({ label }: { label: string }) {
  return (
      <div style={{
          color: "#666",
          fontSize: "12px",
          fontWeight: 500,
          padding: "8px 12px",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
      }}>
          {label}
      </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", backgroundColor: "#eee", margin: "8px 0" }} />;
}
// Updated MenuItem component
function MenuItem({ icon, label, shortcut, onClick }: MenuItemProps) {
  return (
      <div
          style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              // "&:hover": {
              //     backgroundColor: "#f5f5f5",
              // },
          }}
          onClick={onClick}
      >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {icon}
              <span>{label}</span>
          </div>
          {shortcut && <span style={{ color: "#666", fontSize: "12px" }}>{shortcut}</span>}
      </div>
  );
}

interface ThemeButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ThemeButton({ icon, label }: ThemeButtonProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                borderRadius: "4px",
                cursor: "pointer",
                border: "1px solid #ddd",
                // ":hover": {
                //     borderColor: "#aaa",
                // },
            }}
        >
            {icon}
            <span style={{ fontSize: "0.8em", marginTop: "4px" }}>{label}</span>
        </div>
    );
}

// Import necessary NextAuth.js functions if you want to handle sign in/out here
import { signIn, signOut } from "next-auth/react";