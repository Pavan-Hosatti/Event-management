import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Award, ChevronRight, Play, ArrowRight, Calendar, Volume2, VolumeX } from 'lucide-react';
import VoiceBot from '../components/Voicebot/VoiceBot';
import api from '../utilis/api';
import { adminAPI } from '../utilis/api';

// IMPORT FOR I18N
import { useTranslation } from 'react-i18next'; 

// IMPORT FOR TTS HOOK
import useTextToSpeech from '../hooks/useTextToSpeech'; 

gsap.registerPlugin(ScrollTrigger);



const EventHome = () => {
  // HOOK FOR I18N
  const { t, i18n } = useTranslation(); 
  
  // Text-to-Speech Hook Integration
  const currentLangCode = i18n.resolvedLanguage;
  const { speak, stop, isSupported } = useTextToSpeech(currentLangCode);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);

  // TTS Function
  const handleDoubleClickSpeech = (text) => {
    if (isSupported && !isMuted) {
      stop();
      speak(text);
    } else if (isSupported && isMuted) {
      console.log("TTS is currently muted.");
    } else {
      console.warn("Text-to-Speech not supported in this browser.");
    }
  };
  
  // Toggle Mute
  const toggleMute = () => {
    if (!isMuted) {
      stop();
    }
    setIsMuted(prev => !prev);
  };

  // ============================================
  // 🔌 BACKEND INTEGRATION POINT #1: Fetch Stats
  // ============================================
  // TODO: Replace mock data with API call
  // Expected endpoint: GET /api/stats
  // Expected response: { activeStudents: number, totalEvents: number, clubsActive: number, certificates: number }
  
  const [stats, setStats] = useState([
    { value: '5K+', label: t('Active Students') },
    { value: '500+', label: t('Events Hosted') },
    { value: '100+', label: t('Active Clubs') },
    { value: '3K+', label: t('Certificates Issued') }
  ]);

  // Backend: fetch live stats if available
  useEffect(() => {
  const fetchStats = async () => {
  try {
    const response = await adminAPI.getStats();
    const data = response.data;
    
    setStats([
      { value: `${data.activeStudents || data.activeStudents || 0}+`, label: t('Active Students') },
      { value: `${data.totalEvents || 0}+`, label: t('Events Hosted') },
      { value: `${data.clubsActive || 0}+`, label: t('Active Clubs') },
      { value: `${data.certificates || 0}+`, label: t('Certificates Issued') }
    ]);
  } catch (error) {
    console.warn('Error fetching stats, using mock values:', error.message);
    // Optionally set fallback values
    setStats([
      { value: '0+', label: t('Active Students') },
      { value: '0+', label: t('Events Hosted') },
      { value: '0+', label: t('Active Clubs') },
      { value: '0+', label: t('Certificates Issued') }
    ]);
  }
};
    fetchStats();
  }, [t]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Auto-play stages every 5 seconds
    const stageInterval = setInterval(() => {
      setActiveStage(prev => (prev + 1) % 5);
    }, 5000);

    // GSAP ANIMATION LOGIC
    const fadeElements = containerRef.current.querySelectorAll('.fade-in');
    fadeElements.forEach((el, idx) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: idx * 0.15, ease: 'power2.out' }
      );
    });

    const heroImage = containerRef.current.querySelector('.hero-image');
    if (heroImage) {
      gsap.to(heroImage, {
        scrollTrigger: {
          trigger: heroImage,
          start: 'top center',
          end: 'bottom center',
          scrub: 0.5,
        },
        y: 50,
        ease: 'none',
      });
    }

    const cards = containerRef.current.querySelectorAll('.event-card');
    cards.forEach((card, idx) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.5,
          },
          opacity: 1,
          y: 0,
          ease: 'power2.out',
        }
      );
    });

    const ctaSection = containerRef.current.querySelector('.cta-section');
    if (ctaSection) {
      gsap.fromTo(
        ctaSection,
        { opacity: 0, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: ctaSection,
            start: 'top 70%',
            end: 'top 40%',
            scrub: 0.5,
          },
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
        }
      );
    }

    return () => {
      clearInterval(stageInterval);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Data for How It Works section
  const howItWorks = [
    { 
      icon: '🔐', 
      title: t('Sign Up & Login'), 
      desc: t('Register with your college email and choose your role - Student or Club Admin.') 
    },
    { 
      icon: '🎯', 
      title: t('Discover Events'), 
      desc: t('Browse through exciting events from various clubs with filters and smart recommendations.') 
    },
    { 
      icon: '📝', 
      title: t('Register Instantly'), 
      desc: t('One-click registration with automatic QR code generation for seamless check-in.') 
    },
    { 
      icon: '✅', 
      title: t('Attend & Check-In'), 
      desc: t('Show your QR code at the venue for quick attendance marking and real-time tracking.') 
    },
    { 
      icon: '🏆', 
      title: t('Earn Certificates'), 
      desc: t('Automatically receive certificates for attended events directly in your profile.') 
    }
  ];

  // Data for Why Students Love Us section
  const studentFeatures = [
    { icon: '📅', title: t('All Events, One Place'), desc: t('Discover every college event in a single platform') },
    { icon: '🚀', title: t('Smart Recommendations'), desc: t('AI suggests events based on your interests and history') },
    { icon: '⚡', title: t('Quick Registration'), desc: t('Register in seconds with instant QR code generation') },
    { icon: '📱', title: t('Mobile-Friendly'), desc: t('Access everything on-the-go from any device') },
    { icon: '🎓', title: t('Track Your Journey'), desc: t('View all attended events and earned certificates') },
    { icon: '🔔', title: t('Never Miss Out'), desc: t('Get timely reminders before events you registered for') }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative w-full h-screen flex items-center overflow-hidden">
        {/* Hero Image Background */}
        <div className="hero-image absolute inset-0 w-full h-full top-0">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop"
            alt={t("College Events")}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/70 to-indigo-900/75" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex items-center h-full">
          <div className="max-w-3xl">
            
            {/* Mute/Unmute Button */}
            {isSupported && (
              <motion.button
                onClick={toggleMute}
                className="fixed top-6 right-24 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition z-[100] border border-white/20"
                title={isMuted ? t('Unmute TTS') : t('Mute TTS')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </motion.button>
            )}
            
            <motion.div
              className="fade-in inline-flex items-center gap-2 px-6 py-3 bg-indigo-500/20 backdrop-blur-md border border-indigo-300/60 rounded-full text-indigo-100 text-sm font-medium mb-8 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              onDoubleClick={() => handleDoubleClickSpeech(t('Transforming Campus Event Experience'))} 
            >
              <Award className="w-4 h-4" />
              <span>{t('Transforming Campus Event Experience')}</span>
              <ChevronRight className="w-4 h-4" />
            </motion.div>

            <motion.h1
              className="fade-in text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              onDoubleClick={() => handleDoubleClickSpeech(`${t('EventHub')}. ${t('Your Campus, Your Events')}`)} 
            >
              {t('EventHub')}
              <span className="block text-indigo-200">{t('Your Campus, Your Events')}</span>
            </motion.h1>

            <motion.p
              className="fade-in text-xl md:text-2xl text-gray-50 mb-10 leading-relaxed font-medium max-w-2xl drop-shadow-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onDoubleClick={() => handleDoubleClickSpeech(t('Discover, register, and attend college events seamlessly with QR-based check-in, AI recommendations, and instant certificates.'))} 
            >
              {t('Discover, register, and attend college events seamlessly with QR-based check-in, AI recommendations, and instant certificates.')}
            </motion.p>

            <motion.div
              className="fade-in flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <button className="px-10 py-4 bg-indigo-500 text-white font-bold rounded-full hover:bg-indigo-600 transition-all duration-300 flex items-center gap-2 text-lg hover:shadow-lg">
                {t('Browse Events')}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button className="px-10 py-4 border-2 border-indigo-200 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center gap-2 text-lg">
                <Play className="w-5 h-5" /> {t('Watch Demo')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative py-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                onDoubleClick={() => handleDoubleClickSpeech(stat.label)} 
              >
                <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-32 lg:py-40 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 
              className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6"
              onDoubleClick={() => handleDoubleClickSpeech(`${t('How')} EventHub ${t('Works')}`)} 
            >
              {t('How')} <span className="text-indigo-600 dark:text-indigo-400">EventHub</span> {t('Works')}
            </h2>
          </motion.div>

          <div className="flex gap-3 justify-center flex-wrap mb-16">
            {['01', '02', '03', '04', '05'].map((num, idx) => (
              <motion.button
                key={idx}
                onClick={() => setActiveStage(idx)}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  activeStage === idx
                    ? 'bg-indigo-600 text-white scale-110 shadow-lg'
                    : 'bg-white/70 dark:bg-slate-800/70 text-gray-700 dark:text-gray-300 border border-indigo-200 dark:border-indigo-700'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {num}
              </motion.button>
            ))}
          </div>

          <motion.div
            className="p-12 bg-white/80 dark:bg-slate-800/80 rounded-3xl border border-indigo-200 dark:border-indigo-700 backdrop-blur-sm"
            key={activeStage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onDoubleClick={() => handleDoubleClickSpeech(`${howItWorks[activeStage].title}. ${howItWorks[activeStage].desc}`)} 
          >
            <div className="text-6xl mb-6">
              {howItWorks[activeStage].icon}
            </div>
            <h3 className="text-4xl font-black text-indigo-700 dark:text-indigo-400 mb-4">
              {howItWorks[activeStage].title}
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {howItWorks[activeStage].desc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* WHY STUDENTS LOVE US */}
      <section className="relative py-32 lg:py-40 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-6"
            onDoubleClick={() => handleDoubleClickSpeech(`${t('Why')} ${t('Students Love Us')}`)} 
          >
            {t('Why')} <span className="text-indigo-600 dark:text-indigo-400">{t('Students Love Us')}</span>
          </h2>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                className="event-card p-8 bg-white/90 dark:bg-slate-800/90 rounded-2xl border border-indigo-200 dark:border-indigo-700 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                viewport={{ once: true, margin: '-100px' }}
                whileHover={{ y: -5 }}
                onDoubleClick={() => handleDoubleClickSpeech(`${feature.title}. ${feature.desc}`)}
              >
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-40 lg:py-48 overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-600">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center cta-section">
          <motion.h2
            className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            onDoubleClick={() => handleDoubleClickSpeech(t('Ready to Transform Your Campus Experience?'))} 
          >
            {t('Ready to Transform Your Campus Experience?')}
          </motion.h2>

          <motion.p
            className="text-2xl md:text-3xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            onDoubleClick={() => handleDoubleClickSpeech(t('Join thousands of students already discovering and attending amazing events.'))} 
          >
            {t('Join thousands of students already discovering and attending amazing events.')}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <button className="px-12 py-5 bg-white text-indigo-600 font-black text-lg rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
              {t('Get Started Now')}
            </button>
            
            <button className="px-12 py-5 border-3 border-white text-white font-black text-lg rounded-full hover:bg-white/20 transition-all flex items-center gap-2">
              <Calendar className="w-5 h-5" /> {t('View All Events')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 
                className="text-3xl font-black text-indigo-400 mb-4"
                onDoubleClick={() => handleDoubleClickSpeech(t('EventHub'))} 
              >
                {t('EventHub')}
              </h3>
              <p 
                className="text-slate-400"
                onDoubleClick={() => handleDoubleClickSpeech(t('Your Gateway to Campus Events'))} 
              >
                {t('Your Gateway to Campus Events')}
              </p>
            </div>
            <div>
              <h4 
                className="font-semibold text-white mb-4"
                onDoubleClick={() => handleDoubleClickSpeech(t('Platform'))} 
              >
                {t('Platform')}
              </h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('How it Works'))}>{t('How it Works')}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('For Students'))}>{t('For Students')}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('For Clubs'))}>{t('For Clubs')}</a></li>
              </ul>
            </div>
            <div>
              <h4 
                className="font-semibold text-white mb-4"
                onDoubleClick={() => handleDoubleClickSpeech(t('Resources'))} 
              >
                {t('Resources')}
              </h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Documentation'))}>{t('Documentation')}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Help Center'))}>{t('Help Center')}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Community'))}>{t('Community')}</a></li>
              </ul>
            </div>
            <div>
              <h4 
                className="font-semibold text-white mb-4"
                onDoubleClick={() => handleDoubleClickSpeech(t('Company'))} 
              >
                {t('Company')}
              </h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('About Us'))}>{t('About Us')}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Careers'))}>{t('Careers')}</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition" onDoubleClick={() => handleDoubleClickSpeech(t('Contact'))}>{t('Contact')}</a></li>
              </ul>
            </div>
          </div>
          <div 
            className="border-t border-slate-700 pt-8 text-center text-slate-500 text-sm"
            onDoubleClick={() => handleDoubleClickSpeech(t('© 2025 EventHub. Built with heart for students everywhere.'))}
          >
            <p>{t('© 2025 EventManager. Built with ❤️ for students everywhere.')}</p>
          </div>
        </div>
      </footer>
      
      {/* VoiceBot Placement */}
      <VoiceBot />
    </div>
  );
};

export default EventHome;