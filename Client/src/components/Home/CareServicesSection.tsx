
import { motion } from "framer-motion";

function CareServicesSection() {
  return (
    <section className="py-20 w-full bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - Animated Illustration */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <motion.img
            src="/assets/Home/doctor_illustration.jpg"
            alt="Healthcare Services"
            className="w-full h-auto max-w-lg mx-auto"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating elements */}
          <motion.div
            className="absolute top-10 left-10 bg-blue-100 rounded-full p-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-3xl">🩺</span>
          </motion.div>

          <motion.div
            className="absolute bottom-10 right-10 bg-blue-100 rounded-full p-4"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <span className="text-3xl">💉</span>
          </motion.div>
        </motion.div>

        {/* Right side - Content */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Comprehensive
            <span className="text-blue-600"> Healthcare</span>
          </h2>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-start space-x-4"
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🩺</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Expert Doctors</h3>
                <p className="text-gray-600">
                  Consult with top specialists across various medical fields.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex items-start space-x-4"
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-600">
                  Schedule appointments seamlessly with real-time availability.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex items-start space-x-4"
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Trusted Hospitals</h3>
                <p className="text-gray-600">
                  Partnered with leading urban hospitals for quality care.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CareServicesSection;
