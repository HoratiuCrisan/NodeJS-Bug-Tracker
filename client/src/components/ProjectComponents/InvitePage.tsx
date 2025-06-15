import React, { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserContext } from '../../context/UserProvider';
import { joinProject } from '../../api/projects';
import { Project } from '../../types/Project';

export const InvitePage = () => {
    const [params] = useSearchParams();
    const {user} = useContext(UserContext);

    useEffect(() => {
        const code = params.get("code");
        const expires = params.get("expires");

        const handleJoinProject = async () => {
            if (!user || !code || !expires) return;

            try {
                const response: Project = await joinProject(code, Number(expires));

                window.location.href=`/projects/${response.id}`
            } catch (error) {
                console.error(error);
                return;
            }
        }

        handleJoinProject();
    }, [user, params]);

    return (
        <div>Joining project...</div>
    )
}
