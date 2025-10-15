import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { API_BASE_URL } from '../config/api';

export default function ContactPage() {
  const { showSuccess, showError } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      showError('Please fill in all fields');
      return;
    }
    if (!validateEmail(form.email)) {
      showError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
     const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        showSuccess('Message sent! We will get back to you shortly.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        showError(json.error || 'Failed to send message');
      }
    } catch {
      showError('Server error, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
    }}>
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
          border: '3px solid #d4af37',
          boxShadow: '0 20px 60px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header with football texture */}
        <div className="relative overflow-hidden" style={{
          background: 'linear-gradient(90deg, #2c5f2d 0%, #1a3a1b 50%, #2c5f2d 100%)',
          borderBottom: '4px solid #d4af37',
          padding: '40px 20px',
        }}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 10px,
              #fff 10px,
              #fff 12px
            )`,
          }}></div>
          
          <h1 className="text-center font-black text-5xl md:text-6xl tracking-tight relative z-10" style={{
            color: '#fff',
            textShadow: '3px 3px 0 #000, -1px -1px 0 #d4af37, 1px -1px 0 #d4af37, -1px 1px 0 #d4af37, 1px 1px 0 #d4af37, 0 0 20px rgba(212, 175, 55, 0.5)',
            fontFamily: 'Impact, "Arial Black", sans-serif',
            letterSpacing: '2px',
          }}>
            CONTACT
          </h1>
          <div className="text-center mt-2 relative z-10 flex items-center justify-center gap-3">
            <span style={{ fontSize: '2rem' }}>🤜</span>
            <span className="inline-block px-4 py-1 text-sm font-bold tracking-widest" style={{
              background: '#d4af37',
              color: '#000',
              clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
            }}>
              GET IN THE GAME
            </span>
            <span style={{ fontSize: '2rem' }}>🤛</span>
          </div>
        </div>

        {/* Form section */}
        <div className="p-8 md:p-12">
          <div className="space-y-6">
            {/* Name and Email side by side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  autoComplete="off"
                  placeholder=" "
                  className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg text-white placeholder-transparent focus:outline-none transition-all duration-300"
                  style={{
                    borderColor: '#4a5568',
                    fontFamily: '"Arial Black", sans-serif',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#4a5568'}
                />
                <label
                  htmlFor="name"
                  className="absolute left-3 -top-3 px-2 text-xs font-bold uppercase tracking-wide transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-xs pointer-events-none"
                  style={{
                    background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
                    color: '#d4af37',
                  }}
                >
                  Name
                </label>
              </div>

              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  autoComplete="off"
                  placeholder=" "
                  className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg text-white placeholder-transparent focus:outline-none transition-all duration-300"
                  style={{
                    borderColor: '#4a5568',
                    fontFamily: '"Arial Black", sans-serif',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#4a5568'}
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 -top-3 px-2 text-xs font-bold uppercase tracking-wide transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-xs pointer-events-none"
                  style={{
                    background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
                    color: '#d4af37',
                  }}
                >
                  Email
                </label>
              </div>
            </div>

            <div className="relative">
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                disabled={loading}
                required
                autoComplete="off"
                placeholder=" "
                className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg text-white placeholder-transparent focus:outline-none transition-all duration-300"
                style={{
                  borderColor: '#4a5568',
                  fontFamily: '"Arial Black", sans-serif',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#4a5568'}
              />
              <label
                htmlFor="subject"
                className="absolute left-3 -top-3 px-2 text-xs font-bold uppercase tracking-wide transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-xs pointer-events-none"
                style={{
                  background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
                  color: '#d4af37',
                }}
              >
                Subject
              </label>
            </div>

            <div className="relative">
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder=" "
                className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg text-white placeholder-transparent focus:outline-none resize-none transition-all duration-300"
                style={{
                  borderColor: '#4a5568',
                  fontFamily: '"Arial Black", sans-serif',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#4a5568'}
              />
              <label
                htmlFor="message"
                className="absolute left-3 -top-3 px-2 text-xs font-bold uppercase tracking-wide transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:-top-3 peer-focus:text-xs pointer-events-none"
                style={{
                  background: 'linear-gradient(145deg, #1a1f3a 0%, #0f1729 100%)',
                  color: '#d4af37',
                }}
              >
                Message
              </label>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 font-black text-xl uppercase tracking-wider rounded-lg transition-all duration-300 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                color: '#000',
                border: '3px solid #000',
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)',
                fontFamily: 'Impact, "Arial Black", sans-serif',
                boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
              }}
            >
              <span className="relative z-10">
                {loading ? '🏈 SENDING...' : '🏈 SEND MESSAGE 🏈'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{
                transform: 'translateX(-100%)',
              }}></div>
            </button>
          </div>

          {/* Footer text */}
          <div className="mt-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wide" style={{
              color: '#d4af37',
              fontFamily: '"Arial Black", sans-serif',
            }}>
             💪 No Days Off • Grind Never Stops
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}