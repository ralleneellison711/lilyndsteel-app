import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@shared/routes';
import { Upload, X, Lock, Edit2, DollarSign, MessageSquare, Check, Trash2, Star } from 'lucide-react';
import type { Product, NumerologyMeaning, BraceletStyle, Crystal, Review } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_password', password);
        onLogin();
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Error verifying password');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-display text-center mb-2">Admin Access</h1>
        <p className="text-center text-muted-foreground mb-8">Enter your password to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoFocus
              data-testid="input-admin-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={isChecking || !password}
            className="w-full"
            data-testid="button-login"
          >
            {isChecking ? 'Verifying...' : 'Access Admin'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'bracelet' as 'bracelet' | 'crystal',
    numerologyNumber: '',
    crystalImageUrl: '', // New field for numerology crystal image
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json() as Promise<Product[]>;
    },
  });

  const { data: meanings } = useQuery({
    queryKey: ['/api/numerology'],
    queryFn: async () => {
      const res = await fetch('/api/numerology');
      return res.json() as Promise<NumerologyMeaning[]>;
    },
  });

  const { data: braceletStyles } = useQuery<BraceletStyle[]>({
    queryKey: ['/api/bracelet-styles'],
  });

  const { data: crystalsList } = useQuery<Crystal[]>({
    queryKey: ['/api/crystals'],
  });

  const adminHeaders = () => ({
    'x-admin-password': sessionStorage.getItem('admin_password') || '',
  });

  const { data: allReviews = [] } = useQuery<Review[]>({
    queryKey: ['/api/admin/reviews'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviews', { headers: adminHeaders() });
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
  });

  const approveReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PATCH',
        headers: adminHeaders(),
      });
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: 'Review approved!' });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({ title: 'Review deleted' });
    },
  });

  const updateBraceletPriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      return apiRequest('PATCH', `/api/bracelet-styles/${id}`, { price });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bracelet-styles'] });
      toast({ title: 'Bracelet price updated!' });
    },
  });

  const updateCrystalPriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      return apiRequest('PATCH', `/api/crystals/${id}`, { price });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crystals'] });
      toast({ title: 'Crystal price updated!' });
    },
  });

  const handleSelectProduct = (productId: number) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      setEditingProductId(productId);
      setMode('edit');
      setFormData({
        name: product.name,
        description: product.description,
        price: (product.price / 100).toFixed(2),
        imageUrl: '',
        category: product.category as 'bracelet' | 'crystal',
        numerologyNumber: product.numerologyNumber?.toString() || '',
        crystalImageUrl: '',
      });
      try {
        const urls = JSON.parse(product.imageUrl);
        setImageUrls(Array.isArray(urls) ? urls : [product.imageUrl]);
      } catch {
        setImageUrls([product.imageUrl]);
      }
    }
  };

  const resetForm = () => {
    setMode('create');
    setEditingProductId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: 'bracelet',
      numerologyNumber: '',
      crystalImageUrl: '',
    });
    setImageUrls([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImageUrls([...imageUrls, dataUrl]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Handle product creation/update
      if (imageUrls.length === 0 && data.category === 'bracelet') {
        throw new Error('Please upload at least one image');
      }
      const body = {
        name: data.name,
        description: data.description,
        price: Math.round(parseFloat(data.price) * 100),
        imageUrl: JSON.stringify(imageUrls),
        category: data.category,
        numerologyNumber: data.category === 'crystal' ? parseInt(data.numerologyNumber) : null,
      };

      const url = mode === 'edit' && editingProductId 
        ? api.products.update.path.replace(':id', String(editingProductId))
        : api.products.create.path;
      
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`Failed to ${mode === 'edit' ? 'update' : 'create'} product`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: `Product ${mode === 'edit' ? 'updated' : 'added'} successfully!` });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: `Error ${mode === 'edit' ? 'updating' : 'adding'} product`, variant: 'destructive' });
    },
  });

  const updateMeaningMutation = useMutation({
    mutationFn: async ({ number, crystalImageUrl, bibleVerse }: { number: number, crystalImageUrl?: string, bibleVerse?: string }) => {
      const response = await fetch(`/api/numerology/${number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crystalImageUrl, bibleVerse }),
      });
      if (!response.ok) throw new Error('Failed to update numerology meaning');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Numerology meaning updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/numerology'] });
    },
    onError: () => {
      toast({ title: 'Error updating numerology meaning', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h1>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            Logout
          </Button>
        </div>

        {mode === 'create' && (
          <div className="mb-6 p-4 bg-card rounded-lg border border-border">
            <Label className="text-sm font-medium mb-3 block">Or Select Existing Product to Edit</Label>
            <Select onValueChange={(val) => handleSelectProduct(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product to edit..." />
              </SelectTrigger>
              <SelectContent>
                {products?.filter(p => p.category === 'bracelet').map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {mode === 'edit' && (
          <Button onClick={resetForm} variant="outline" className="mb-6" data-testid="button-back">
            Back to Add New
          </Button>
        )}
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Silver Moonstone Bracelet"
                required
                data-testid="input-product-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bracelet">Bracelet</SelectItem>
                  <SelectItem value="crystal">Crystal Add-on</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="45.00"
                required
                data-testid="input-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product..."
                required
                data-testid="textarea-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Product Images (Add Multiple for Different Angles)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => document.getElementById('image-input')?.click()}>
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload images or paste URLs</p>
                <p className="text-xs text-muted-foreground mt-1">Add 2-5 images for different angles</p>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="input-image-file"
                  multiple
                />
              </div>
              
              <div className="mt-2">
                <Label htmlFor="imageUrl" className="text-xs">Or paste image URLs (one per line):</Label>
                <textarea
                  id="imageUrl"
                  value={imageUrls.join('\n')}
                  onChange={(e) => {
                    const urls = e.target.value.split('\n').filter(url => url.trim());
                    setImageUrls(urls);
                  }}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  className="w-full p-2 border border-input rounded-md text-sm font-mono focus:ring-2 focus:ring-accent"
                  rows={3}
                  data-testid="textarea-image-urls"
                />
              </div>

              {/* Image previews */}
              {imageUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Images ({imageUrls.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-image-${idx}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {formData.category === 'crystal' && (
              <div className="space-y-2">
                <Label htmlFor="numerologyNumber">Numerology Number (1-9)</Label>
                <Select value={formData.numerologyNumber} onValueChange={(value) => setFormData({ ...formData, numerologyNumber: value })}>
                  <SelectTrigger id="numerologyNumber" data-testid="select-numerology">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full"
              data-testid="button-submit"
            >
              {mutation.isPending ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Product' : 'Add Product')}
            </Button>
          </form>
        </Card>

        {/* Pricing Section */}
        <Card className="p-6 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display">Pricing</h2>
          </div>
          
          {/* Bracelet Prices */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4 text-muted-foreground">Bracelet Styles</h3>
            <div className="space-y-2">
              {braceletStyles?.slice().sort((a, b) => {
                const order = ['the root', 'the witness', 'the integration', 'the bloom'];
                return order.indexOf(a.displayName.toLowerCase()) - order.indexOf(b.displayName.toLowerCase());
              }).map((style) => (
                <div key={style.id} className="flex items-center justify-between py-3 border-b border-border">
                  <span className="font-medium">{style.displayName}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={(style.price / 100).toFixed(2)}
                      className="w-24 text-right"
                      data-testid={`input-bracelet-price-${style.id}`}
                      onBlur={(e) => {
                        const newPrice = Math.round(parseFloat(e.target.value) * 100);
                        if (newPrice !== style.price && !isNaN(newPrice)) {
                          updateBraceletPriceMutation.mutate({ id: style.id, price: newPrice });
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Crystal Prices */}
          <div>
            <h3 className="font-semibold mb-4 text-muted-foreground">Crystal Charms</h3>
            <div className="space-y-2">
              {crystalsList?.map((crystal) => (
                <div key={crystal.id} className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">{crystal.displayName}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      defaultValue={(crystal.price / 100).toFixed(2)}
                      className="w-20 text-right"
                      data-testid={`input-crystal-price-${crystal.id}`}
                      onBlur={(e) => {
                        const newPrice = Math.round(parseFloat(e.target.value) * 100);
                        if (newPrice !== crystal.price && !isNaN(newPrice)) {
                          updateCrystalPriceMutation.mutate({ id: crystal.id, price: newPrice });
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* New Section: Numerology Crystal Images */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-display mb-6">Numerology Crystal Images</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Assign specific crystal images to each numerology number (1-9). These will appear on the Numerology page.
          </p>
          
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map((num) => {
              const currentMeaning = meanings?.find(m => m.number === num);
              return (
                <div key={num} className="p-4 bg-muted/30 rounded-lg border border-border flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-display text-xl text-primary shrink-0">
                    {num}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{currentMeaning?.crystalName || 'Loading...'}</h3>
                    </div>
                    
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Crystal Image</Label>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Paste image URL..." 
                              value={currentMeaning?.crystalImageUrl || ''}
                              onChange={(e) => {
                                updateMeaningMutation.mutate({ 
                                  number: num, 
                                  crystalImageUrl: e.target.value 
                                });
                              }}
                              className="flex-1"
                            />
                            <div className="relative">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => document.getElementById(`crystal-upload-${num}`)?.click()}
                                title="Upload Image"
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                              <input
                                id={`crystal-upload-${num}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      updateMeaningMutation.mutate({ 
                                        number: num, 
                                        crystalImageUrl: reader.result as string 
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Bible Verse</Label>
                          <Input 
                            placeholder="Enter Bible verse..." 
                            defaultValue={currentMeaning?.bibleVerse || ''}
                            onBlur={(e) => {
                              if (e.target.value !== currentMeaning?.bibleVerse) {
                                updateMeaningMutation.mutate({ 
                                  number: num, 
                                  bibleVerse: e.target.value 
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                      {currentMeaning?.crystalImageUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                          <img 
                            src={currentMeaning.crystalImageUrl} 
                            alt={currentMeaning.crystalName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reviews Management */}
        <Card className="p-6 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display">Reviews</h2>
            <span className="text-sm text-muted-foreground ml-auto">
              {allReviews.filter(r => !r.approved).length} pending
            </span>
          </div>

          {allReviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {allReviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 rounded-md border ${
                    review.approved ? "border-border bg-muted/20" : "border-yellow-500/30 bg-yellow-50/5"
                  }`}
                  data-testid={`admin-review-${review.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{review.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        {!review.approved && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!review.approved && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => approveReviewMutation.mutate(review.id)}
                          title="Approve"
                          data-testid={`button-approve-review-${review.id}`}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        title="Delete"
                        data-testid={`button-delete-review-${review.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-8 p-4 bg-card rounded-md">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Select "Bracelet" for your sterling silver pieces with Lily charms</li>
            <li>• Select "Crystal Add-on" for numerology crystals (link to numbers 1-9)</li>
            <li>• Upload 2-5 images from different angles for better product views</li>
            <li>• Click the arrows on product cards to see different angles in the Shop</li>
            <li>• Prices are in USD - they'll be converted to cents for storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
