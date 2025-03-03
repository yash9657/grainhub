import { motion } from "framer-motion";
import { ArrowRight, BarChart2, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: BarChart2,
    title: "Commission Tracking",
    description: "Effortlessly track and manage your commissions from both buyers and sellers.",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Maintain detailed records of your buyers and sellers in one place.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Keep all your business transactions secure and well-documented.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold">Dalali</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg bg-primary text-white transition-all hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Streamline Your
                <span className="text-primary"> Grain Business</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                The ultimate commission tracking solution for grain business brokers. Manage your buyers,
                sellers, and commissions all in one place.
              </p>
              <div className="mt-10 flex flex-col items-center gap-5">
                <Link
                  to="/signup"
                  className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white transition-all hover:bg-primary/90"
                >
                  Start Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="https://www.producthunt.com/posts/grainbroker-hub?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-grainbroker‑hub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=934120&theme=light&t=1740976768104"
                    alt="Grainbroker Hub - Commission tracking solution for grain business brokers | Product Hunt"
                    style={{ width: "250px", height: "54px" }}
                    width={250}
                    height={54}
                  />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Why Choose Dalali?</h2>
              <p className="mt-4 text-gray-600">
                Everything you need to manage your grain brokerage business efficiently
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-card rounded-xl p-6"
                >
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Dalali. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;