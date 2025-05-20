export interface NavbarProps {
    username: string | null
    profileImage: string
}

/* Since the profile menu component is in the navbar, its interface 
will be found in the Navbar interfaces file */

export interface ProfileMenuProps {
    isOpen: boolean
    onOpen: (value: boolean) => void
}