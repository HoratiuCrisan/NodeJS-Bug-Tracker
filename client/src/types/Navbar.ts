export interface NavbarProps {
    username: string | null
    profileImage: string
    onSidebar: (value: boolean) => void;
    sidebarValue: boolean;
}

/* Since the profile menu component is in the navbar, its interface 
will be found in the Navbar interfaces file */

export interface ProfileMenuProps {
    isOpen: boolean
    onOpen: (value: boolean) => void
}