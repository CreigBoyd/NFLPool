import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.clear();

console.log(`%c
       _______________
      /               \\
     /                 \\
    |   ~~~~~~~~~~~~   |
    |  /           \\  |
    | |   *     *   | |
    | |     ^      | |
    | |   \\___/   | |
    |  \\_________/  |
     \\             /
      \\___________/

    ~~~ AMERICAN FOOTBALL ~~~

`, 'color: #a43e00; font-family: monospace; font-size: 12px; font-weight: bold;');

console.log('%c********************************************************************************', 'color: #065f46;');

console.log('%c*                                                                              *', 'color: #065f46;');

console.log('%c*                         Ready for some Football?                            *', 'color: #065f46; font-weight: bold;');

console.log('%c*                                                                              *', 'color: #065f46;');

console.log('%c*                 Join the Ultimate NFL Pool Experience!                      *', 'color: #059669; font-weight: bold;');

console.log('%c*                                                                              *', 'color: #065f46;');

console.log('%c*                       Step on the 50-yard line!                             *', 'color: #065f46;');

console.log('%c*                                                                              *', 'color: #065f46;');

console.log('%c*                     https://603Design.com Football Pool                      *', 'color: #2563eb; text-decoration: underline; font-weight: bold;');

console.log('%c*                                                                              *', 'color: #065f46;');

console.log('%c********************************************************************************', 'color: #065f46;');

// Add a fun function they can call
window.joinTheTeam = function() {
  console.log('%c🏈 Touchdown! You\'ve joined the team!', 'font-size: 16px; color: #059669; font-weight: bold;');
  console.log('%c📧 Send your resume to careers@603Design.com', 'font-size: 14px; color: #065f46; font-weight: normal;');
  console.log('%c🔥 We want passionate devs who love football AND clean code!', 'font-size: 14px; color: #a43e00; font-weight: bold;');
};

console.log('%c\n💡 Tip: Type %cjoinTheTeam()%c to join our crew and score a career touchdown!', 
  'color: #374151;', 
  'color: #2563eb; font-weight: bold; background: #dbf4ff; padding: 2px 6px; border-radius: 3px;',
  'color: #374151;'
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
