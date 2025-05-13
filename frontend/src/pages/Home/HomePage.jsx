import { Link } from "react-router-dom";
import "../../assets/HomePage.css";

function HomePage() {
  return (
    <div className="home-page">
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">E2Rent: Платформа оренди енергетичного обладнання</h1>
            <p className="hero-subtitle">
              Ваше інтерактивне рішення для зручної оренди та здачі в оренду
              енергетичного обладнання по всій Україні. Переглядайте оголошення
              без реєстрації, а для оренди чи додавання власного обладнання -
              просто зареєструйтесь.
            </p>
            <Link to="/equipments" className="cta-button hero-cta">
              Переглянути доступне обладнання
            </Link>
          </div>
          <div className="hero-image-placeholder">
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Переваги E2Rent</h2>
          <div className="features-grid">
            {/* Перевага 1 */}
            <div className="feature-card">
              <h3 className="feature-title">Широкий каталог обладнання</h3>
              <p className="feature-description">
                Легко переглядайте доступне обладнання від різних користувачів
                без необхідності реєстрації.
              </p>
            </div>

            {/* Перевага 2 */}
            <div className="feature-card">
              <h3 className="feature-title">Можливість здавати власне обладнання</h3>
              <p className="feature-description">
                Зареєстровані користувачі можуть додавати своє енергетичне обладнання
                для здачі в оренду, отримуючи додатковий дохід.
              </p>
            </div>

            {/* Перевага 3 */}
            <div className="feature-card">
              <h3 className="feature-title">Безпечна оренда</h3>
              <p className="feature-description">
                Процес оренди відбувається через платформу, включаючи створення
                та узгодження запитів між користувачами.
              </p>
            </div>

            {/* Перевага 4 - Акцент на дипломній роботі */}
            <div className="feature-card">
              <h3 className="feature-title">Надійна технологічна база</h3>
              <p className="feature-description">
                Платформа реалізована на основі мікросервісної архітектури, що гарантує
                високу стабільність та продуктивність.
              </p>
            </div>
          </div>
        </section>

        {/* Секція: Як це працює? */}
        <section className="how-it-works-section">
          <h2 className="section-title">Як це працює?</h2>
          <div className="steps-container">
            <div className="step">
              <h4>1. Знайдіть потрібне обладнання</h4>
              <p>Переглядайте каталог обладнання, доступний для всіх відвідувачів.</p>
            </div>
            <div className="step">
              <h4>2. Авторизуйтесь для взаємодії</h4>
              <p>Увійдіть або зареєструйтесь, щоб мати можливість орендувати чи здавати обладнання.</p>
            </div>
            <div className="step">
              <h4>3. Оформіть запит або додайте оголошення</h4>
              <p>Як орендар - створіть запит на обране обладнання. Як власник - додайте інформацію про ваше обладнання для модерації.</p>
            </div>
            <div className="step">
              <h4>4. Узгодження та користування</h4>
              <p>Власник обладнання підтверджує запит на оренду. Після узгодження ви використовуєте обладнання.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default HomePage;