'use client';

import { FloatingPaths } from './floating-path';
import LangSwitcher from '../LangSwitcher';

interface AuthPageProps {
  title: string;
  description: string;
  lang?: 'en' | 'ar';
  onLangToggle: () => void;
  children: React.ReactNode;
}

export function AuthPage({ title, description, lang = 'en', onLangToggle, children }: AuthPageProps) {
  const ar = lang === 'ar';

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ── Brand panel ── */}
      <div className="relative hidden h-full flex-col border-r p-10 lg:flex" style={{ background: 'var(--panel-gradient)' }}>
        <div className="from-primary absolute inset-0 z-10 bg-gradient-to-t to-primary-dark opacity-20" />
        <a href="/" className="z-10 flex items-center gap-3 text-white">
        	<img
          src="/logo-v2.png"
          alt="Morgan's Hope Logo"
          className="theme-logo"
          width={50}
          height={50}
          style={{ objectFit: 'contain' }}
					/>
          <p className="text-2xl mt-3 font-semibold theme-logo italic">Morgan's Hope</p>
				</a>
        
        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <q className="text-xl text-white/90">
              {ar ? 'فرصة ثانية لكل نَفَس' : 'A Second Chance for Every Breath'}
            </q>
            <footer className="font-mono text-sm font-semibold text-white/70">
              ~ Morgan's Hope
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0 opacity-60">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-primary/.1)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-primary/.02)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-primary/.06)_0,--theme(--color-primary/.02)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-primary/.06)_0,--theme(--color-primary/.02)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
				</div>

				<div className='flex lg:hidden items-center justify-between px-4'>
					<a href='/' className="flex items-center theme-logo justify-center gap-5 lg:hidden">
	          <img
              src="/logo-v2.png"
              alt="Morgan's Hope Logo"
              style={{ height: 30, width: 30, objectFit: 'contain', transform: 'scale(1.35) translateY(-2px)', marginRight: -8 }}
						/>
			      <div dir="ltr" className="lg:hidden flex items-center gap-1.5">
		          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', letterSpacing: -0.5, lineHeight: 1 }}>Morgan&apos;s</span>
		          <span style={{ fontSize: 18, fontWeight: 400, fontStyle: 'italic', color: 'var(--primary)', opacity: 0.85, lineHeight: 1 }}>Hope</span>
		        </div>
					</a>
					
	          <LangSwitcher ar={ar} onLangToggle={onLangToggle} />
					</div>
				
        <div className="hidden lg:block" style={{ position: 'absolute', top: 28, right: 20, zIndex: 10 }}>
          <LangSwitcher ar={ar} onLangToggle={onLangToggle} />
        </div>
        	
        <div className="px-4 lg:px-0 lg:mx-auto space-y-4 mt-8 lg:mt-0 sm:w-sm">
          <div className="flex flex-col space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-wide">
              {title}
            </h1>
            <p className="text-muted-foreground text-base">
              {description}
            </p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}