import { cn } from '@/lib/utils';

export type ClassificationLevel = 'TOP_SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'UNCLASSIFIED';

interface ClassificationBannerProps {
  level: ClassificationLevel;
  caveats?: string[];
  position?: 'top' | 'bottom' | 'both';
}

const classificationConfig: Record<ClassificationLevel, {
  label: string;
  className: string;
  abbrev: string;
}> = {
  TOP_SECRET: {
    label: 'TOP SECRET',
    className: 'classification-ts',
    abbrev: 'TS',
  },
  SECRET: {
    label: 'SECRET',
    className: 'classification-secret',
    abbrev: 'S',
  },
  CONFIDENTIAL: {
    label: 'CONFIDENTIAL',
    className: 'classification-confidential',
    abbrev: 'C',
  },
  UNCLASSIFIED: {
    label: 'UNCLASSIFIED',
    className: 'classification-unclassified',
    abbrev: 'U',
  },
};

export const ClassificationBanner = ({ 
  level, 
  caveats = [],
  position = 'top' 
}: ClassificationBannerProps) => {
  const config = classificationConfig[level];
  const caveatsText = caveats.length > 0 ? ` // ${caveats.join(' / ')}` : '';

  const Banner = () => (
    <div className={cn('classification-banner', config.className)}>
      {config.label}{caveatsText}
    </div>
  );

  if (position === 'both') {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <Banner />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-[100]">
          <Banner />
        </div>
      </>
    );
  }

  return (
    <div className={cn(
      'fixed left-0 right-0 z-[100]',
      position === 'top' ? 'top-0' : 'bottom-0'
    )}>
      <Banner />
    </div>
  );
};

export const ClassificationBadge = ({ level }: { level: ClassificationLevel }) => {
  const config = classificationConfig[level];
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-tactical tracking-widest',
      config.className
    )}>
      {config.abbrev}
    </span>
  );
};
