import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function HelpPage() {
  return (
    <main>
      <Header />

      <div className="home-content">
        <section className="welcome">
          <h1>Help & Support</h1>
          <p>Frequently asked questions and support for Polytechnic Hub</p>
        </section>

        <section className="courses-page">
          <div className="branch-card" style={{ padding: "16px 20px" }}>
            <h3 style={{ fontSize: "17px", color: "#ffffff", marginBottom: "8px" }}>
              How do I access semester notes?
            </h3>
            <p style={{ color: "#aebdd3", fontSize: "14px" }}>
              Head to the Courses tab or click on any branch to navigate directly to your semester materials.
            </p>
          </div>

          <div className="branch-card" style={{ padding: "16px 20px" }}>
            <h3 style={{ fontSize: "17px", color: "#ffffff", marginBottom: "8px" }}>
              Are previous year questions (PYQ) available?
            </h3>
            <p style={{ color: "#aebdd3", fontSize: "14px" }}>
              Yes, PYQs for all semesters and branches are categorized under each subject.
            </p>
          </div>

          <div className="branch-card" style={{ padding: "16px 20px" }}>
            <h3 style={{ fontSize: "17px", color: "#ffffff", marginBottom: "8px" }}>
              Need assistance?
            </h3>
            <p style={{ color: "#aebdd3", fontSize: "14px" }}>
              Reach out to your campus coordinator or email support@polytechnichub.edu.
            </p>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
