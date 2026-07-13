import { useState, useEffect } from 'react';
import { supabase } from '../auth';
import { Link } from 'react-router-dom';
import './DashboardSection.css';

function DashboardSection({ user, profile }) {
  const [joinStatus, setJoinStatus] = useState('Checking...');
  
  useEffect(() => {
    let mounted = true;
    
    async function checkJoinStatus() {
      if (!user?.email || !supabase) {
        if (mounted) setJoinStatus('Not logged in');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('Candidates_data_table')
          .select('Email')
          .eq('Email', user.email)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
          console.error("Error checking join status:", error);
          if (mounted) setJoinStatus('Error checking status');
          return;
        }
        
        if (mounted) {
          setJoinStatus(data ? 'Registered' : 'Not Registered');
        }
      } catch (err) {
        if (mounted) setJoinStatus('Error checking status');
      }
    }
    
    checkJoinStatus();
    return () => { mounted = false; };
  }, [user]);

  // If there's no user, render the preview state
  if (!user) {
    return (
      <div className="new-dashboard-preview">
        <div className="new-dashboard-overlay">
          <h2>Please login to use the dashboard</h2>
          <Link to="/signin?next=/dashboard" className="new-dashboard-login-btn">Login</Link>
        </div>
        <div className="new-dashboard-content blurred">
          <div className="new-dashboard-card">
            <h3>Profile Summary</h3>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john@example.com</p>
            <p><strong>Username:</strong> johndoe</p>
          </div>
          <div className="new-dashboard-card">
            <h3>Terminal Phi Status</h3>
            <p>Status: Registered</p>
          </div>
          <div className="new-dashboard-card">
            <h3>Upcoming Event</h3>
            <h4>Hackathon 2026</h4>
            <p>Join us for our annual 24-hour hackathon!</p>
            <button disabled>Register Now</button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated state
  return (
    <div className="new-dashboard-container">
      <div className="new-dashboard-content">
        <div className="new-dashboard-card">
          <h3>Profile Summary</h3>
          <p><strong>Name:</strong> {profile?.name || user?.user_metadata?.full_name || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Username:</strong> {profile?.username || 'Not set'}</p>
          <Link to="/profile" className="new-dashboard-link">View Full Profile & Stats</Link>
        </div>
        
        <div className="new-dashboard-card">
          <h3>Terminal Phi Status</h3>
          <p>Status: <span className={`status-${joinStatus.replace(/\s+/g, '-').replace(/\./g, '').toLowerCase()}`}>{joinStatus}</span></p>
          {joinStatus === 'Not Registered' && (
            <Link to="/join" className="new-dashboard-link">Fill Join Form</Link>
          )}
        </div>
        
        <div className="new-dashboard-card">
          <h3>Upcoming Event</h3>
          <h4>CodeRed Hackathon 2026</h4>
          <p>Date: October 15th, 2026</p>
          <p>Join us for a 24-hour coding challenge. Build, learn, and win prizes!</p>
          <button className="new-dashboard-btn" onClick={() => alert('Registration coming soon!')}>Register Now</button>
        </div>
      </div>
    </div>
  );
}

export default DashboardSection;
