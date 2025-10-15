
import { useState, useEffect } from "react";
import CustomButton from "../UI/CustomButton";
import { useNavigate } from "react-router-dom";


const sliderData = [
  {
    id: 1,
    image: "/assets/Home/doctor_img_1.jpg",
    title: "Expert Care. Anytime.",
    subtitle: "Top Doctors & Specialists",
    discount: "Free Consultation",
    description:
      "Connect with leading healthcare professionals for personalized care and consultations.",
  },
  {
    id: 2,
    image: "/assets/Home/clinic_img_1.jpg",
    title: "Advanced Facilities.",
    subtitle: "State-of-the-Art Hospitals",
    discount: "20% Off Diagnostics",
    description:
      "Access cutting-edge medical technology and facilities for accurate diagnosis and treatment.",
  },
  {
    id: 3,
    image: "/assets/Home/appointment_img_1.jpg",
    title: "Quick Appointments.",
    subtitle: "Book Instantly",
    discount: "Priority Booking",
    description:
      "Schedule appointments with top doctors at your convenience, with minimal wait times.",
  },
];

function HeroSection() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative lg:mt-0 h-[1000px] md:h-[1100px] lg:h-auto lg:min-h-screen w-full overflow-hidden bg-gray-50">
      {/* Background Layer with Pattern */}
      <div
        className="absolute inset-0 z-20 opacity-40"
        style={{
          backgroundImage: "url('/assets/healthcare_bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Grid Background */}
      <div className="absolute inset-0 z-15 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Content Container */}
      <div className="absolute lg:top-20 inset-0 z-30 flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6 max-w-xl mx-auto lg:mx-0">
              {/* Discount Badge */}
              <div className="inline-block">
                <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  {sliderData[currentSlide].discount}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                {sliderData[currentSlide].title}
              </h1>

              <h2 className="text-2xl md:text-3xl text-blue-600 font-semibold">
                {sliderData[currentSlide].subtitle}
              </h2>

              <p className="text-gray-600 text-lg">
                {sliderData[currentSlide].description}
              </p>

              <div className="pt-4">
                <CustomButton
                  title="Book Now"
                  bgColor="bg-blue-600"
                  textColor="text-white"
                  onClick={() => navigate("/appointments")}
                  style="hover:bg-blue-700 px-8 py-3 text-lg"
                />
              </div>
            </div>

            {/* Image Slider */}
            <div className="relative w-full max-w-md mx-auto">
              <div className="relative aspect-square w-full">
                {sliderData.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 transform ${
                      index === currentSlide
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-full"
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3">
                {sliderData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
