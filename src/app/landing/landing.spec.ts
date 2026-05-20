import { TestBed } from '@angular/core/testing';
import { Landing } from './landing';

describe('Landing', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
    }).compileComponents();
  });

  it('should create the landing page', () => {
    const fixture = TestBed.createComponent(Landing);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the hero heading', async () => {
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Engenharia notável');
  });

  it('should render external links with safe rel attributes', async () => {
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const externalLinks = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'),
    );

    expect(externalLinks.length).toBeGreaterThanOrEqual(4);
    expect(
      externalLinks.every(
        (link) => link.rel.includes('noopener') && link.rel.includes('noreferrer'),
      ),
    ).toBe(true);
  });
});
