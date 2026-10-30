import {
  SITE_URL,
  generateAlternates,
  generateOgImages,
  getBlogAlternates,
  getPortfolioAlternates,
} from '../seo-utils';

describe('SITE_URL', () => {
  it('does not end with a trailing slash', () => {
    expect(SITE_URL).not.toMatch(/\/$/);
  });

  it('is a valid https URL', () => {
    expect(SITE_URL).toMatch(/^https:\/\//);
  });
});

describe('generateAlternates', () => {
  const result = generateAlternates('/tr/haberler');

  it('sets canonical to the TR path', () => {
    expect(result.canonical).toBe(`${SITE_URL}/tr/haberler`);
  });

  it('includes tr-TR language', () => {
    expect(result.languages['tr-TR']).toBe(`${SITE_URL}/tr/haberler`);
  });

  it('has no non-Turkish language entries', () => {
    expect(Object.keys(result.languages)).toEqual(['tr-TR', 'x-default']);
  });

  it('sets x-default to TR path', () => {
    expect(result.languages['x-default']).toBe(`${SITE_URL}/tr/haberler`);
  });
});

describe('generateOgImages', () => {
  it('returns fallback og-image when no URL provided', () => {
    const images = generateOgImages();
    expect(images[0].url).toBe(`${SITE_URL}/og-image.jpg`);
  });

  it('uses provided image URL', () => {
    const images = generateOgImages('https://example.com/img.jpg', 'Test');
    expect(images[0].url).toBe('https://example.com/img.jpg');
    expect(images[0].alt).toBe('Test');
  });

  it('returns 1200x630 dimensions', () => {
    const images = generateOgImages();
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });
});

describe('slug-based alternate helpers', () => {
  it('getBlogAlternates builds haberler URLs', () => {
    const result = getBlogAlternates('test-slug');
    expect(result.languages['tr-TR']).toContain('/tr/haberler/test-slug');
    expect(result.canonical).toBe(`${SITE_URL}/tr/haberler/test-slug`);
  });

  it('getPortfolioAlternates builds portfolio URLs', () => {
    const result = getPortfolioAlternates('my-project');
    expect(result.languages['tr-TR']).toContain('/tr/portfolio/my-project');
    expect(result.canonical).toBe(`${SITE_URL}/tr/portfolio/my-project`);
  });

});
