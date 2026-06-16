import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Users, BookOpen, Globe, Star, MapPin, Target, Lightbulb, PlaySquare, Flag, ArrowUpRight } from 'lucide-react';
import appLogo from '../assets/images/logo.png';
import africanGovBg from '../assets/images/african_governance_bg_1781130107908.png';
import FloatingFaces from '../components/FloatingFaces';
import AfricanMap from '../components/AfricanMap';

interface LandingPageProps {
  onEnter: () => void;
  onFellowshipClick: () => void;
}

export default function LandingPage({ onEnter, onFellowshipClick }: LandingPageProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-[#cca568] selection:text-black">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-24 px-6 relative overflow-hidden">
        <FloatingFaces sectionIndex={0} />
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-40 scale-105"
          style={{
            backgroundImage: `url(${africanGovBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) grayscale(50%)'
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />

        <div className="container mx-auto relative z-10 max-w-5xl text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-32 h-32 md:w-40 md:h-40 mb-8 bg-white/5 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-[0_0_60px_rgba(204,165,104,0.3)]"
          >
            <img src={appLogo} alt="Golden Minds Africa" className="w-full h-full object-contain filter drop-shadow-xl" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6"
          >
            <span className="text-white">GOLDEN MINDS </span>
            <span className="text-[#cca568]">AFRICA</span>
            <span className="block text-xl md:text-3xl font-sans font-light tracking-[0.2em] mt-4 text-[#e5e5e5] uppercase">Round Table</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mb-12 leading-relaxed"
          >
            A pan-African, youth- and women-led governance and policy roundtable dedicated to leadership development, public policy innovation, and ethical governance advancement across Africa.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={onEnter}
              className="bg-gradient-to-r from-[#cca568] to-[#b89154] text-black px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(204,165,104,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              Enter Fellowship Portal
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#about"
              className="px-8 py-4 rounded-full font-medium text-lg border border-white/20 hover:bg-white/5 transition-all flex items-center justify-center"
            >
              Discover Our Profile
            </a>
          </motion.div>


        </div>
      </section>

      {/* --- VISION & MISSION --- */}
      <section id="about" className="py-24 px-6 bg-[#0a0a0c] border-y border-white/5 relative overflow-hidden">
        <FloatingFaces sectionIndex={1} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Strategic Intent</h2>
            <div className="w-24 h-1 bg-[#cca568] mx-auto rounded-full mb-6"></div>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg pt-4">
              Bridging the gap between youth potential and institutional governance by transforming young people and women from passive stakeholders into informed decision-makers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              {...fadeIn} 
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-white/5 border border-white/10 p-10 rounded-[32px] hover:border-[#cca568]/50 transition-colors"
            >
              <div className="w-14 h-14 bg-[#cca568]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#cca568]/20">
                <Target className="w-7 h-7 text-[#cca568]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                To become Africa's leading youth- and women-driven governance and policy roundtable shaping ethical leadership, inclusive policymaking, and sustainable institutional transformation.
              </p>
            </motion.div>

            <motion.div 
              {...fadeIn} 
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/5 border border-white/10 p-10 rounded-[32px] hover:border-[#cca568]/50 transition-colors"
            >
              <div className="w-14 h-14 bg-[#cca568]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#cca568]/20">
                <Lightbulb className="w-7 h-7 text-[#cca568]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                To equip African youth and women with advanced governance knowledge, policy formulation skills, and leadership competencies that enable them to actively influence public institutions, private sector governance, and civil society structures.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="py-24 px-6 relative bg-[#050505] overflow-hidden">
        <FloatingFaces sectionIndex={2} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div {...fadeIn} className="mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-[#cca568]">Core Values</h2>
            <p className="text-gray-400 max-w-2xl text-lg">The foundational principles guiding our pursuit of a greater Africa.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Ethical Leadership", desc: "Upholding integrity, accountability, and moral courage in leadership." },
              { icon: Users, title: "Inclusivity & Equity", desc: "Ensuring meaningful participation of women and marginalized groups." },
              { icon: BookOpen, title: "Policy Excellence", desc: "Evidence-based, research-driven policy engagement." },
              { icon: MapPin, title: "Transparency", desc: "Open governance and responsible institutional conduct." },
              { icon: Globe, title: "African-Centered", desc: "Solutions rooted in African realities and aspirations." }
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#0f0f12] p-8 rounded-[24px] border border-white/5 hover:bg-[#15151a] transition-colors"
              >
                <value.icon className="w-10 h-10 text-[#cca568] mb-5" strokeWidth={1.5} />
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROGRAMMATIC AREAS --- */}
      <section className="py-24 px-6 bg-[#cca568] text-black relative overflow-hidden">
        <FloatingFaces sectionIndex={3} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Programmatic Areas</h2>
            <div className="w-24 h-1 bg-black mx-auto rounded-full mb-6"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Governance & Policy Labs",
                desc: "Structured policy research and simulation platforms focused on African governance challenges."
              },
              {
                title: "Leadership Development Academy",
                desc: "Training programs on ethical leadership, strategic governance, diplomacy, and institutional management."
              },
              {
                title: "Women in Governance Initiative",
                desc: "Targeted leadership development and policy advocacy programs for women."
              },
              {
                title: "Youth Policy Dialogue Series",
                desc: "Continental and national dialogue forums engaging policymakers and youth leaders."
              }
            ].map((prog, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-[24px] border border-black/10 hover:bg-white/20 transition-colors"
              >
                <h3 className="text-2xl font-bold mb-3">{prog.title}</h3>
                <p className="text-black/80 text-lg font-medium">{prog.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTINENTAL REACH / MAP --- */}
      <section className="py-24 px-6 bg-[#0a0a0c] border-t border-white/5 relative overflow-hidden">
        <FloatingFaces sectionIndex={5} />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-[#cca568]">Continental Reach</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg pt-4">
              Explore our fellowship regions and specialized governance focuses across the African continent.
            </p>
          </motion.div>
          <motion.div 
            {...fadeIn}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full max-w-4xl mx-auto h-[600px] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <AfricanMap />
          </motion.div>
        </div>
      </section>

      {/* --- OBJECTIVES & TARGETS --- */}
      <section className="py-24 px-6 bg-[#050505] border-t border-white/10 relative overflow-hidden">
        <FloatingFaces sectionIndex={4} />
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 relative z-10">
          
          <motion.div {...fadeIn}>
            <h2 className="text-3xl font-serif font-bold mb-8 flex items-center gap-3">
              <Flag className="text-[#cca568] w-8 h-8" />
              Strategic Objectives
            </h2>
            <ul className="space-y-6">
              {[
                "Strengthen youth and women participation in governance and policy formulation.",
                "Develop leadership pipelines aligned with national, regional, and continental needs.",
                "Conduct policy research and produce position papers and advisory reports.",
                "Facilitate high-level dialogue between youth, governments, academia, and private institutions.",
                "Promote ethical governance and leadership accountability across African institutions."
              ].map((obj, i) => (
                <li key={i} className="flex items-start gap-4 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-[#15151a] text-[#cca568] flex items-center justify-center font-bold font-serif shrink-0 border border-[#cca568]/20">{i + 1}</div>
                  <p className="mt-1 leading-relaxed text-[15px]">{obj}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-serif font-bold mb-8 flex items-center gap-3">
              <Users className="text-[#cca568] w-8 h-8" />
              Target Beneficiaries
            </h2>
            <div className="bg-[#0f0f12] p-8 rounded-[32px] border border-white/5 space-y-4">
              {[
                "Youth leaders (18–35 years)",
                "Women leaders and professionals",
                "University students and academic researchers",
                "Emerging policymakers and governance professionals"
              ].map((target, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-[#15151a] rounded-2xl">
                  <Star className="text-[#cca568] w-5 h-5 shrink-0" />
                  <span className="text-gray-200 font-medium">{target}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER & CTA --- */}
      <footer className="bg-[#0a0a0c] pt-24 pb-12 px-6 border-t border-white/10 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#cca568]/5 opacity-10 blur-3xl pointer-events-none" />
        
        <div className="container mx-auto relative z-10 max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Ready to Shape Africa's Future?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={onEnter}
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#cca568] hover:text-black transition-all inline-flex items-center gap-3 group w-full sm:w-auto justify-center"
            >
              Access the Fellowship Portal
              <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
            <button 
              onClick={onFellowshipClick}
              className="bg-[#1a1a1a] text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center gap-3 group w-full sm:w-auto justify-center"
            >
              Learn about the Fellowship Program
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="sm:hidden mb-12 flex flex-col items-center gap-4 text-sm text-gray-500 uppercase tracking-widest">
                <p>AU Agenda 2063</p>
                <p>UN SDGs</p>
                <p>African Youth Charter</p>
                <p>AGA</p>
          </div>

          <div className="hidden sm:flex flex-wrap justify-center gap-8 text-sm text-gray-500 font-medium uppercase tracking-widest mb-16">
            <span>AU Agenda 2063</span>
            <span>•</span>
            <span>UN SDGs</span>
            <span>•</span>
            <span>African Youth Charter</span>
            <span>•</span>
            <span>African Governance Architecture (AGA)</span>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-4">
              <img src={appLogo} alt="GMR" className="w-8 h-8 opacity-50 grayscale" />
              <span>© 2026 Golden Minds Roundtable. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://www.goldenmindsroundtable.co.za" className="hover:text-[#cca568] transition-colors">www.goldenmindsroundtable.co.za</a>
              <a href="tel:+27676171261" className="hover:text-[#cca568] transition-colors">+27 67 617 1261</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
