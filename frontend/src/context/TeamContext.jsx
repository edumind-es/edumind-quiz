import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('team_token');
        const team_name = localStorage.getItem('team_name');
        const team_id = localStorage.getItem('team_id');
        const proposal_id = localStorage.getItem('proposal_id');
        if (token && team_name) {
            setTeam({ name: team_name, id: team_id, proposalId: proposal_id });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const loginTeam = async (pin) => {
        const response = await api.post(`/auth/team/login?pin=${pin}`);
        const { access_token, team_name, team_id, proposal_id } = response.data;
        localStorage.setItem('team_token', access_token);
        localStorage.setItem('team_name', team_name);
        localStorage.setItem('team_id', team_id);
        localStorage.setItem('proposal_id', proposal_id);
        setTeam({ name: team_name, id: team_id, proposalId: proposal_id });
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        return true;
    };

    const logoutTeam = () => {
        localStorage.removeItem('team_token');
        localStorage.removeItem('team_name');
        localStorage.removeItem('team_id');
        localStorage.removeItem('proposal_id');
        delete api.defaults.headers.common['Authorization'];
        setTeam(null);
    };

    return (
        <TeamContext.Provider value={{ team, loginTeam, logoutTeam, loading }}>
            {!loading && children}
        </TeamContext.Provider>
    );
};

export const useTeam = () => useContext(TeamContext);
