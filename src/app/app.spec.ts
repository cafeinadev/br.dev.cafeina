import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the landing title and primary calls to action', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Cafeína Dev');
    expect(
      compiled.querySelector<HTMLAnchorElement>('a[href="https://www.instagram.com/cafeina_dev/"]')
        ?.textContent,
    ).toContain('Falar no Instagram');
    expect(
      compiled.querySelector<HTMLAnchorElement>('a[href="https://www.linkedin.com/in/thbezerra/"]')
        ?.textContent,
    ).toContain('Conectar no LinkedIn');
  });

  it('should render external links with safe rel attributes', async () => {
    const fixture = TestBed.createComponent(App);
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
