import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, ChevronRight, ChevronLeft, Heart, Shield, Eye, Sun, Info, Plus, ShoppingCart, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { LifePath, MotionState, Crystal, BraceletStyle } from "@shared/schema";
import { calculateLifePath, generateBlueprint } from "@shared/numerology-calculator";

type Step = 'calculate' | 'lifepath' | 'motion' | 'blueprint';

export default function Numerology() {
  const [dateStr, setDateStr] = useState("");
  const [calculatedNumber, setCalculatedNumber] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('calculate');
  const [selectedMotion, setSelectedMotion] = useState<string | null>(null);
  const [selectedSupportCrystal, setSelectedSupportCrystal] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  
  const { addToCart } = useCart();

  const { data: lifePaths } = useQuery<LifePath[]>({
    queryKey: ['/api/life-paths'],
  });

  const { data: motionStates } = useQuery<MotionState[]>({
    queryKey: ['/api/motion-states'],
  });

  const { data: crystals } = useQuery<Crystal[]>({
    queryKey: ['/api/crystals'],
  });

  const { data: braceletStyles } = useQuery<BraceletStyle[]>({
    queryKey: ['/api/bracelet-styles'],
  });

  const currentLifePath = lifePaths?.find(p => p.number === calculatedNumber);
  const currentMotion = motionStates?.find(m => m.id === selectedMotion);
  const motionCrystals = crystals?.filter(c => currentMotion?.recommendedCrystalIds?.includes(c.id));

  // Generate blueprint using the new calculator
  const blueprint = useMemo(() => {
    if (!currentLifePath || !crystals || !braceletStyles) return null;
    
    // Convert database types to calculator types
    const lifePathData = {
      number: currentLifePath.number,
      title: currentLifePath.title,
      subtitle: currentLifePath.subtitle || '',
      meaning: currentLifePath.meaning,
      meAffirmation: currentLifePath.meAffirmation,
      coreCrystalIds: currentLifePath.coreCrystalIds || [],
    };
    
    const motionData = currentMotion ? {
      id: currentMotion.id,
      displayName: currentMotion.displayName,
      subtitle: currentMotion.subtitle || '',
      description: currentMotion.description,
      affirmation: currentMotion.affirmation,
      recommendedBraceletStyleId: currentMotion.recommendedBraceletStyleId,
      recommendedCrystalIds: currentMotion.recommendedCrystalIds || [],
    } : null;
    
    const crystalData = crystals.map(c => ({
      id: c.id,
      displayName: c.displayName,
      shortDesc: c.shortDesc,
      price: c.price,
      imageUrl: c.imageUrl,
    }));
    
    const braceletData = braceletStyles.map(b => ({
      id: b.id,
      displayName: b.displayName,
      symbol: b.symbol,
      motion: b.motion,
      shortDesc: b.shortDesc,
      price: b.price,
      imageUrl: b.imageUrl,
    }));
    
    return generateBlueprint({
      lifePath: lifePathData,
      motion: motionData,
      crystals: crystalData,
      braceletStyles: braceletData,
      selectedSupportCrystalId: selectedSupportCrystal,
    });
  }, [currentLifePath, currentMotion, crystals, braceletStyles, selectedSupportCrystal]);

  // Derived values from blueprint
  const coreCrystal = blueprint?.crystals.core || null;
  const supportCrystal = blueprint?.crystals.support || null;
  const recommendedBracelet = blueprint?.braceletStyle || null;

  const motionIcons: Record<string, any> = {
    contraction: Shield,
    stillness: Eye,
    harmonizing: Heart,
    expansion: Sun,
  };

  const calculateNumerology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr) return;

    setIsCalculating(true);

    try {
      const lifePathNumber = calculateLifePath(dateStr);
      
      setTimeout(() => {
        setCalculatedNumber(lifePathNumber);
        setIsCalculating(false);
        setCurrentStep('lifepath');
      }, 1500);
    } catch (error) {
      console.error('Error calculating life path:', error);
      setIsCalculating(false);
    }
  };

  const reset = () => {
    setCalculatedNumber(null);
    setDateStr("");
    setCurrentStep('calculate');
    setSelectedMotion(null);
    setSelectedSupportCrystal(null);
  };

  const selectNumber = (num: number) => {
    setCalculatedNumber(num);
    setDateStr("");
    setCurrentStep('lifepath');
  };

  const goToMotionStep = () => {
    setCurrentStep('motion');
  };

  const goToBlueprint = () => {
    setCurrentStep('blueprint');
  };

  const goBack = () => {
    if (currentStep === 'blueprint') {
      setCurrentStep('motion');
    } else if (currentStep === 'motion') {
      setCurrentStep('lifepath');
    } else if (currentStep === 'lifepath') {
      setCurrentStep('calculate');
      setCalculatedNumber(null);
    }
  };

  const handleAddBraceletToCart = () => {
    if (recommendedBracelet) {
      // Use a unique numeric ID based on the bracelet id string
      const uniqueId = recommendedBracelet.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000);
      const cartItem = {
        id: uniqueId,
        name: recommendedBracelet.displayName,
        description: recommendedBracelet.shortDesc,
        price: recommendedBracelet.price,
        imageUrl: recommendedBracelet.imageUrl || '',
        category: 'bracelet',
        numerologyNumber: calculatedNumber,
      };
      addToCart(cartItem);
      setAddedItems(prev => new Set(prev).add('bracelet'));
    }
  };

  const handleAddCrystalToCart = (crystal: { id: string; displayName: string; shortDesc: string; price: number; imageUrl?: string | null }, type: 'core' | 'support') => {
    // Use a unique numeric ID based on the crystal id string
    const uniqueId = crystal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 2000);
    const cartItem = {
      id: uniqueId,
      name: crystal.displayName,
      description: crystal.shortDesc,
      price: crystal.price,
      imageUrl: crystal.imageUrl || '',
      category: 'crystal',
      numerologyNumber: null,
    };
    addToCart(cartItem);
    setAddedItems(prev => new Set(prev).add(type === 'core' ? 'core-crystal' : 'support-crystal'));
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4 text-primary">
            {currentStep === 'calculate' && "Discover Your Life Path"}
            {currentStep === 'lifepath' && "Your Life Path"}
            {currentStep === 'motion' && "What Is ME Doing Right Now?"}
            {currentStep === 'blueprint' && "Your Personal Blueprint"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {currentStep === 'calculate' && "Enter your date of birth to begin your journey of self-discovery."}
            {currentStep === 'lifepath' && "Understanding how ME learns itself through this number."}
            {currentStep === 'motion' && "Select the motion that reflects your current season of life."}
            {currentStep === 'blueprint' && "Your personalized bracelet recommendation awaits."}
          </p>
        </motion.div>

        {/* Progress Indicator */}
        {currentStep !== 'calculate' && (
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-2">
              {['lifepath', 'motion', 'blueprint'].map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full transition-colors ${
                    currentStep === step ? 'bg-accent' : 
                    ['lifepath', 'motion', 'blueprint'].indexOf(currentStep) > i ? 'bg-accent/50' : 'bg-border'
                  }`} />
                  {i < 2 && <div className={`w-12 h-0.5 ${
                    ['lifepath', 'motion', 'blueprint'].indexOf(currentStep) > i ? 'bg-accent/50' : 'bg-border'
                  }`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Calculate */}
        <AnimatePresence mode="wait">
          {currentStep === 'calculate' && !isCalculating && (
            <motion.div
              key="calculate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-background p-8 rounded-2xl shadow-xl border border-border">
                <form onSubmit={calculateNumerology} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-input bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all text-lg"
                      data-testid="input-birthdate"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!dateStr}
                    className="w-full"
                    data-testid="button-calculate"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Discover My Life Path
                  </Button>
                </form>
              </div>

              {/* Browse All Numbers */}
              <div className="mt-12">
                <h2 className="text-xl font-display text-center mb-6 text-muted-foreground">Or Select Your Number</h2>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      onClick={() => selectNumber(num)}
                      className="aspect-square font-display text-xl font-bold"
                      data-testid={`button-select-number-${num}`}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {isCalculating && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <Sparkles className="w-16 h-16 text-accent" />
              </motion.div>
              <p className="mt-6 text-xl font-display text-primary animate-pulse">Discovering your path...</p>
            </motion.div>
          )}

          {/* Step: Life Path */}
          {currentStep === 'lifepath' && currentLifePath && (
            <motion.div
              key="lifepath"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="bg-background p-8 md:p-12 rounded-3xl shadow-2xl border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-[8rem] md:text-[12rem] font-display leading-none select-none pointer-events-none">
                  {currentLifePath.number}
                </div>
                
                <div className="relative z-10">
                  <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4">
                    Life Path {currentLifePath.number}
                  </span>
                  
                  <h2 className="text-4xl md:text-5xl font-display text-primary mb-2">{currentLifePath.title}</h2>
                  <h3 className="text-xl md:text-2xl font-display text-accent mb-6">{currentLifePath.subtitle}</h3>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {currentLifePath.meaning}
                  </p>
                  
                  <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 mb-8">
                    <p className="text-primary italic font-medium text-lg leading-relaxed">
                      "{currentLifePath.meAffirmation}"
                    </p>
                  </div>

                  {coreCrystal && (
                    <div className="bg-accent/5 p-6 rounded-xl border border-accent/10 mb-8">
                      <h4 className="font-display text-lg text-accent mb-2">Your Core Crystal</h4>
                      <p className="text-2xl font-display text-primary mb-2">{coreCrystal.displayName}</p>
                      <p className="text-muted-foreground">{coreCrystal.shortDesc}</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" onClick={reset} className="flex-1" data-testid="button-reset-lifepath">
                      <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                    </Button>
                    <Button onClick={goToMotionStep} className="flex-1" data-testid="button-continue-motion">
                      Continue to Motion <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Motion State */}
          {currentStep === 'motion' && (
            <motion.div
              key="motion"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {motionStates?.map((motion) => {
                  const Icon = motionIcons[motion.id] || Heart;
                  const isSelected = selectedMotion === motion.id;
                  
                  return (
                    <button
                      key={motion.id}
                      type="button"
                      onClick={() => setSelectedMotion(motion.id)}
                      className={`p-6 rounded-2xl border-2 text-left w-full hover-elevate active-elevate-2 ${
                        isSelected 
                          ? 'border-accent bg-accent/5' 
                          : 'border-border bg-background'
                      }`}
                      data-testid={`button-motion-${motion.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl text-primary mb-1">{motion.displayName}</h3>
                          <p className="text-sm text-accent mb-2">{motion.subtitle}</p>
                          <p className="text-muted-foreground text-sm mb-4">{motion.description}</p>
                          
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">When to choose:</p>
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                              {motion.whenToChoose?.slice(0, 2).map((reason, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-accent" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedMotion && motionCrystals && motionCrystals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background p-6 rounded-2xl border border-border mb-8"
                >
                  <h4 className="font-display text-lg text-primary mb-4">Select a Support Crystal (Optional)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {motionCrystals.slice(0, 6).map((crystal) => {
                      const isSelected = selectedSupportCrystal === crystal.id;
                      return (
                        <button
                          key={crystal.id}
                          type="button"
                          onClick={() => setSelectedSupportCrystal(isSelected ? null : crystal.id)}
                          className={`p-4 rounded-xl text-left w-full transition-all duration-200 relative ${
                            isSelected
                              ? 'border-primary bg-primary/20 shadow-lg ring-2 ring-primary/50'
                              : 'border-border bg-background hover:border-muted-foreground'
                          }`}
                          style={{ 
                            borderWidth: isSelected ? '3px' : '2px',
                            borderColor: isSelected ? 'hsl(var(--primary))' : undefined
                          }}
                          data-testid={`button-support-crystal-${crystal.id}`}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                              <span className="text-primary-foreground text-xs font-bold">✓</span>
                            </div>
                          )}
                          <p className={`font-display text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{crystal.displayName}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{crystal.shortDesc}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={goBack} className="flex-1" data-testid="button-back-motion">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={goToBlueprint} 
                  disabled={!selectedMotion}
                  className="flex-1"
                  data-testid="button-view-blueprint"
                >
                  View My Blueprint <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step: Blueprint */}
          {currentStep === 'blueprint' && currentLifePath && currentMotion && recommendedBracelet && (
            <motion.div
              key="blueprint"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              {/* Blueprint Card */}
              <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 md:p-12 rounded-3xl shadow-2xl border border-border">
                <div className="text-center mb-10">
                  <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4">
                    Your Personal Blueprint
                  </span>
                  <h2 className="text-3xl md:text-4xl font-display text-primary mb-2">
                    Life Path {currentLifePath.number}: {currentLifePath.title}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    In the season of {currentMotion.displayName}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {/* Bracelet */}
                  <div className={`relative p-6 rounded-2xl text-center transition-all duration-300 ${
                    addedItems.has('bracelet') 
                      ? 'bg-primary/10 border-2 border-primary shadow-lg ring-2 ring-primary/30' 
                      : 'bg-background border border-border'
                  }`}>
                    {addedItems.has('bracelet') && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    {recommendedBracelet.imageUrl && (
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                        <img 
                          src={recommendedBracelet.imageUrl} 
                          alt={recommendedBracelet.displayName}
                          className="w-full h-full object-cover"
                          data-testid="img-bracelet"
                        />
                      </div>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recommended Bracelet</p>
                    <h3 className="font-display text-xl text-primary mb-1">{recommendedBracelet.displayName}</h3>
                    <p className="text-sm text-accent mb-2">{recommendedBracelet.symbol} Symbol</p>
                    <p className="text-sm text-muted-foreground">{recommendedBracelet.shortDesc}</p>
                    <p className="text-lg font-display text-primary mt-4">${(recommendedBracelet.price / 100).toFixed(2)}</p>
                  </div>

                  {/* Core Crystal */}
                  {coreCrystal && (
                    <div className={`relative p-6 rounded-2xl text-center transition-all duration-300 ${
                      addedItems.has('core-crystal') 
                        ? 'bg-primary/10 border-2 border-primary shadow-lg ring-2 ring-primary/30' 
                        : 'bg-background border border-border'
                    }`}>
                      {addedItems.has('core-crystal') && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      {coreCrystal.imageUrl && (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                          <img 
                            src={coreCrystal.imageUrl} 
                            alt={coreCrystal.displayName}
                            className="w-full h-full object-cover"
                            data-testid="img-core-crystal"
                          />
                        </div>
                      )}
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Core Crystal</p>
                      <h3 className="font-display text-xl text-primary mb-1">{coreCrystal.displayName}</h3>
                      <p className="text-sm text-accent mb-2">Life Path Crystal</p>
                      <p className="text-sm text-muted-foreground">{coreCrystal.shortDesc}</p>
                      <p className="text-lg font-display text-primary mt-4">${(coreCrystal.price / 100).toFixed(2)}</p>
                    </div>
                  )}

                  {/* Support Crystal */}
                  {supportCrystal ? (
                    <div className={`relative p-6 rounded-2xl text-center transition-all duration-300 ${
                      addedItems.has('support-crystal') 
                        ? 'bg-primary/10 border-2 border-primary shadow-lg ring-2 ring-primary/30' 
                        : 'bg-background border border-border'
                    }`}>
                      {addedItems.has('support-crystal') && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                      {supportCrystal.imageUrl && (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-muted">
                          <img 
                            src={supportCrystal.imageUrl} 
                            alt={supportCrystal.displayName}
                            className="w-full h-full object-cover"
                            data-testid="img-support-crystal"
                          />
                        </div>
                      )}
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Support Crystal</p>
                      <h3 className="font-display text-xl text-primary mb-1">{supportCrystal.displayName}</h3>
                      <p className="text-sm text-accent mb-2">{currentMotion.displayName} Support</p>
                      <p className="text-sm text-muted-foreground">{supportCrystal.shortDesc}</p>
                      <p className="text-lg font-display text-primary mt-4">${(supportCrystal.price / 100).toFixed(2)}</p>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-6 rounded-2xl border border-dashed border-border text-center flex flex-col items-center justify-center">
                      <p className="text-muted-foreground">No support crystal selected</p>
                      <Button variant="ghost" size="sm" onClick={goBack} className="mt-2" data-testid="button-add-support-back">
                        Go back to add one
                      </Button>
                    </div>
                  )}
                </div>

                {/* Meaning Paragraph */}
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 mb-8">
                  <p className="text-primary leading-relaxed">
                    Your Life Path Number {currentLifePath.number} reveals that {(currentLifePath.meaning || '').toLowerCase()} 
                    Right now, in your season of {(currentMotion.displayName || '').toLowerCase()}, {(currentMotion.description || '').toLowerCase()}
                    {coreCrystal && ` The ${coreCrystal.displayName} supports this journey by helping you stay aligned with your path.`}
                  </p>
                </div>

                {/* Affirmations */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Affirmations</p>
                  <p className="text-lg italic text-accent">"{currentLifePath.meAffirmation}"</p>
                  <p className="text-lg italic text-accent">"{currentMotion.affirmation}"</p>
                </div>

                {/* Natural Variation Notice */}
                <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-full shrink-0">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-primary">Natural Variation:</span> Each piece is handcrafted with natural stones. Your bracelet and crystals will be uniquely yours.
                  </p>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="bg-background p-6 rounded-2xl border border-border">
                <h3 className="font-display text-xl text-primary mb-6 text-center">Build Your Bracelet</h3>
                
                <div className="space-y-4">
                  <Button 
                    size="lg"
                    onClick={handleAddBraceletToCart}
                    className={`w-full transition-all ${addedItems.has('bracelet') ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    data-testid="button-add-bracelet"
                  >
                    {addedItems.has('bracelet') ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add {recommendedBracelet.displayName} Bracelet - ${(recommendedBracelet.price / 100).toFixed(2)}
                      </>
                    )}
                  </Button>
                  
                  {coreCrystal && (
                    <Button 
                      size="lg"
                      variant={addedItems.has('core-crystal') ? 'default' : 'outline'}
                      onClick={() => handleAddCrystalToCart(coreCrystal, 'core')}
                      className={`w-full transition-all ${addedItems.has('core-crystal') ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      data-testid="button-add-core-crystal"
                    >
                      {addedItems.has('core-crystal') ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add {coreCrystal.displayName} (Core) - ${(coreCrystal.price / 100).toFixed(2)}
                        </>
                      )}
                    </Button>
                  )}
                  
                  {supportCrystal && (
                    <Button 
                      size="lg"
                      variant={addedItems.has('support-crystal') ? 'default' : 'outline'}
                      onClick={() => handleAddCrystalToCart(supportCrystal, 'support')}
                      className={`w-full transition-all ${addedItems.has('support-crystal') ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      data-testid="button-add-support-crystal"
                    >
                      {addedItems.has('support-crystal') ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add {supportCrystal.displayName} (Support) - ${(supportCrystal.price / 100).toFixed(2)}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Go to Cart Button */}
              <Link href="/cart">
                <Button size="lg" className="w-full" data-testid="button-go-to-cart">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Go to Cart
                </Button>
              </Link>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={goBack} className="flex-1" data-testid="button-back-blueprint">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back to Motion
                </Button>
                <Button variant="outline" onClick={reset} className="flex-1" data-testid="button-reset-blueprint">
                  <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
