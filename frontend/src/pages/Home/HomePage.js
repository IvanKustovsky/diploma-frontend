// HomePage.js
import React from "react";
import { Link } from "react-router-dom"; // Імпортуємо Link для навігації
import "../../assets/HomePage.css"; // Переконайтесь, що CSS файл підключено

function HomePage() {
  return (
    <div className="home-page">
      {/* Головний контент сторінки */}
      <main className="main-content">
        {/* Секція "Герой" - перше, що бачить користувач */}
        <section className="hero-section">
          <div className="hero-content">
            {/* Використовуємо назву з Header або більш описовий заголовок */}
            <h1 className="hero-title">E2Rent: Оренда енергетичного обладнання</h1>
            <p className="hero-subtitle">
              Сучасна інтерактивна платформа для швидкого пошуку та оренди
              енергетичного обладнання по всій Україні. Побудовано на надійній
              мікросервісній архітектурі.
            </p>
            {/* Кнопка заклику до дії, що веде до каталогу */}
            <Link to="/equipments" className="cta-button hero-cta">
              Переглянути каталог обладнання
            </Link>
          </div>
          {/* Можна додати фонове зображення через CSS */}
          <div className="hero-image-placeholder">
             {/* Сюди можна додати <img> або залишити порожнім для CSS background */}
          </div>
        </section>

        {/* Секція з ключовими перевагами платформи */}
        <section className="features-section">
          <h2 className="section-title">Чому обирають E2Rent?</h2>
          <div className="features-grid"> {/* Використовуємо grid для кращого розташування */}
            {/* Перевага 1 */}
            <div className="feature-card">
              {/* Іконка (додати за допомогою бібліотеки типу React Icons) */}
              {/* <YourIconComponent size={40} className="feature-icon" /> */}
              <h3 className="feature-title">Зручний Пошук</h3>
              <p className="feature-description">
                Інтуїтивний інтерфейс та фільтри допоможуть швидко знайти
                саме те обладнання, яке вам потрібне.
              </p>
            </div>

            {/* Перевага 2 */}
            <div className="feature-card">
              {/* <YourIconComponent size={40} className="feature-icon" /> */}
              <h3 className="feature-title">Надійність та Якість</h3>
              <p className="feature-description">
                Працюємо лише з перевіреними постачальниками та гарантуємо
                високу якість і справність обладнання.
              </p>
            </div>

            {/* Перевага 3 */}
            <div className="feature-card">
              {/* <YourIconComponent size={40} className="feature-icon" /> */}
              <h3 className="feature-title">Гнучкі Умови Оренди</h3>
              <p className="feature-description">
                Обирайте оптимальні для вас терміни та умови оренди – від
                кількох днів до довгострокових проектів.
              </p>
            </div>

             {/* Перевага 4 - Акцент на дипломній роботі */}
             <div className="feature-card">
              {/* <YourIconComponent size={40} className="feature-icon" /> */}
              <h3 className="feature-title">Сучасна Архітектура</h3>
              <p className="feature-description">
                Платформа реалізована на основі <strong>мікросервісів</strong>, що забезпечує
                високу стабільність, масштабованість та швидкість роботи.
              </p>
            </div>
          </div>
        </section>

        {/* Додаткова секція (опціонально): Як це працює? */}
        <section className="how-it-works-section">
           <h2 className="section-title">Як орендувати?</h2>
           <div className="steps-container">
               <div className="step">
                   {/* <StepIcon1 className="step-icon"/> */}
                   <h4>1. Знайдіть</h4>
                   <p>Використовуйте каталог та фільтри для пошуку.</p>
               </div>
               <div className="step">
                   {/* <StepIcon2 className="step-icon"/> */}
                   <h4>2. Забронюйте</h4>
                   <p>Оберіть дати та оформіть запит на оренду.</p>
               </div>
               <div className="step">
                    {/* <StepIcon3 className="step-icon"/> */}
                   <h4>3. Використовуйте</h4>
                   <p>Отримайте обладнання та реалізуйте свої проекти.</p>
               </div>
           </div>
        </section>

      </main>
      {/* Footer вже рендериться через Layout, тому тут його не додаємо */}
    </div>
  );
}

export default HomePage;