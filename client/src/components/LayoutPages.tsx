import React, { useContext, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';
import DefaultProfileImage from '../Images/default-user-photo.svg';
import { UserContext } from '../context/UserProvider';

export const LayoutPages = () => {
  const { user } = useContext(UserContext);
  const [username, setUsername] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>(DefaultProfileImage);
  const [displayedSidebar, setDisplayedSidebar] = useState<boolean>(false);

  const handleDisplayedSidebar = (value: boolean) => {
    setDisplayedSidebar(value);
  };

  useEffect(() => {
    if (user) {
      setProfileImage(user.photoUrl);
      setUsername(user.displayName);
    }
  }, [user]);

  // 👇 Automatically close sidebar on lg+ screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setDisplayedSidebar(false);
      }
    };

    handleResize(); // Run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="block bg-slate-100 overflow-hidden">
      <Navbar
        username={username}
        profileImage={profileImage}
        onSidebar={handleDisplayedSidebar}
        sidebarValue={displayedSidebar}
      />

      <div className="flex pt-16 h-screen">
        {/* Sidebar */}
        <div className="lg:mr-52">
          <Sidebar onSidebar={displayedSidebar} />
        </div>

        {/* Main content area */}
        <div
          onClick={() => {displayedSidebar && handleDisplayedSidebar(!displayedSidebar)}}
          className={`flex-1 overflow-hidden ${
            displayedSidebar ? 'bg-gray-800 bg-opacity-50 lg:bg-opacity-100' : ''
          }`}
        >
          <div className="h-full w-full overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
