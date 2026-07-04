import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Set the date for Science Fair (Change this to your actual date)
    const fairDate = new Date('2026-07-31T09:00:00').getTime();

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = fairDate - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Card Component
    const TimeCard = ({ value, label }) => {
        return (
            <div className="flex flex-col items-center">
                <div className="w-16 md:w-20 h-20 md:h-24 bg-gradient-to-b from-blue-800 to-blue-900 rounded-xl shadow-2xl border-2 border-yellow-400/40 flex items-center justify-center">
                    <span className="text-3xl md:text-4xl font-bold text-yellow-400">
                        {String(value).padStart(2, '0')}
                    </span>
                </div>
                <p className="text-[10px] md:text-xs text-blue-300 mt-2 uppercase tracking-wider font-semibold">
                    {label}
                </p>
            </div>
        );
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white min-h-[500px] flex items-center">
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/images/school-building.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/75 to-blue-700/65"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    
                    {/* LEFT COLUMN */}
                    <div className="text-center lg:text-left">
                        <img 
                            src="/images/science-fair-banner.jpg" 
                            alt="Science Fair 2026-27" 
                            className="max-w-xs mx-auto lg:mx-0 rounded-lg shadow-2xl mb-6 border-4 border-yellow-400/50"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-3 tracking-tight">
                            <span className="text-yellow-400">⚡</span>
                            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                                Spark 4.0
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-blue-200 font-light mb-1">
                            Science Fair 2026-27
                        </p>
                        <p className="text-md text-blue-300 mb-4">
                            Podar International School, Latur · Khadgoan Ring Road
                        </p>
                        
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-4 border border-yellow-400/30 inline-block">
                            <div className="flex items-center gap-3">
                                <span className="text-yellow-400 text-xl font-bold hidden sm:block">📅</span>
                                <div className="flex gap-2 md:gap-3">
                                    <TimeCard value={timeLeft.days} label="Days" />
                                    <TimeCard value={timeLeft.hours} label="Hours" />
                                    <TimeCard value={timeLeft.minutes} label="Mins" />
                                    <TimeCard value={timeLeft.seconds} label="Secs" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Link to="/register" className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition shadow-lg transform hover:scale-105">
                                📝 Register Now
                            </Link>
                            <Link to="/login" className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-bold hover:bg-white/30 transition border border-white/30">
                                🔐 Login
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Results Marquee using JavaScript Animation */}
                    <div className="h-[450px] lg:h-[480px]">
                        <ResultsMarqueeInHero />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Results Marquee with JavaScript Animation (Smooth Continuous Scrolling)
const ResultsMarqueeInHero = () => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const animationRef = useRef(null);
    const [results, setResults] = useState([]);
    const scrollSpeed = 0.8; // pixels per frame (adjust for speed)

    const lastYearData = [
        // ===== GRADE 3 =====
        { position: 1, grade: 3, division: "Champians", team: "Concrete product by using polybags", students: "Saiee Vinayak Karegaonkar, Manvita Vikas Patil, Mahalakshmi Pratik Mahajan" },
        { position: 2, grade: 3, division: "Humbles", team: "3D model on health and hygiene", students: "Laiba Fatima Iliyas Chisti, Shambhavi Sagar Kulkarni" },
        { position: 3, grade: 3, division: "Brilliants", team: "Elevator (pully)", students: "Manasvi Swapnil Patil, Devanshi Dinesh Gulbile, Deetya Vyanktesh Ninawe" },
        { position: 3, grade: 3, division: "Fantastics", team: "Food pyramid", students: "Devika Balasaheb Jawale, Shivam Rajeswar Tondare" },

        // ===== GRADE 4 =====
        { position: 1, grade: 4, division: "Aspirants", team: "Robot", students: "Pawar Sayani Sachin, Patil Aaradhya Gajanan, Indalkar Swanandi Subhashrao" },
        { position: 2, grade: 4, division: "Aspirants", team: "Rain water harvesting", students: "Aarush Seshrao Jadhav, Ashutosh Santosh Bendre" },
        { position: 2, grade: 4, division: "Champians", team: "Recycling of the waste", students: "Aayesha Ahmad Khan Pathan, Shatakshi Sandip Thodsare" },
        { position: 2, grade: 4, division: "Champians", team: "Working Model on Health Hygiene", students: "Anvita Ajay Fugate, Jigisha Rakesh Swami" },
        { position: 2, grade: 4, division: "Fantastics", team: "Hydraulic machine (Crane)", students: "Manas Mohankumar Shete, Reyansh Basweshwar Kavthale, Devansh Jayraj Nagthane" },
        { position: 3, grade: 4, division: "Gems", team: "Human Organs", students: "Ilisha Mahesh Kondekar, Rajeswari Vikas Jadhav" },

        // ===== GRADE 5 =====
        { position: 1, grade: 5, division: "Enthuziasts", team: "Energy conservation", students: "Karande Jayvardhan Dhananjay, Karad Vedant Nagnath" },
        { position: 2, grade: 5, division: "Enthuziasts", team: "Smart farm", students: "Kolekar Samarth Bhaskar, Shelke Manan Vivekanand" },
        { position: 3, grade: 5, division: "Brilliants", team: "Water Conservation", students: "Maahi Vilas Lagaskar, Ishani Dattatray Mule" },

        // ===== GRADE 6 =====
        { position: 1, grade: 6, division: "Diligents", team: "Solar and wind energy", students: "Riddhi Pramod Hogale, Drushti Ramesh Rathod" },
        { position: 1, grade: 6, division: "Innovatives", team: "Prevention of pollution", students: "Deshmukh Ishwari Deepak, Ambure Pranjal Vijay" },
        { position: 2, grade: 6, division: "Fantastics", team: "Door Automation", students: "Jadhav Rajnandini Vikas, Nanaware Swarali Santosh, Suryawanshi Vidya Nagnath" },
        { position: 3, grade: 6, division: "Diligents", team: "Air Pollution controlling unit", students: "Lamture Ayan Priyanka, Khadap Shivnarayan Laxman, Bombale Sainath Dnyaneshwar" },
        { position: 3, grade: 6, division: "Innovatives", team: "Levitation power and magnetism", students: "Pawar Yuvraj Nagesh, Nengule Shaurya Saudagar, Mulani Asad Baksar" },

        // ===== GRADE 7 =====
        { position: 1, grade: 7, division: "Fantastics", team: "City & Village", students: "Satpute Pranali Ramkishan, Biradar Trushika Chandrashekhar, Gandale Arshatee Govind" },
        { position: 2, grade: 7, division: "Diligents", team: "Waste Management", students: "Dewansh Narayan Nagmode, Om Ganesh Bhave, Viraj Shrinivas Kamble" },
        { position: 2, grade: 7, division: "Enthuziasts", team: "Sensor Factory", students: "Sangwe Arpita Santosh, Jamadar Aayat Salim" },
        { position: 3, grade: 7, division: "Diligents", team: "Raagwani (Flute) LumiFlow (Solar Irrigation)", students: "Samiksha Bharat Kamble, Rajnandini Manoj Digrase, Abhinya Ajit Patil" },
        { position: 3, grade: 7, division: "Fantastics", team: "Automated Animal Safety System", students: "Satpute Sankalp Santosh, Shinde Prithviraj Shailesh, Pandge Ayush Mahesh" },

        // ===== GRADE 8 =====
        { position: 1, grade: 8, division: "Diligents", team: "Smart City Model", students: "Arush Santosh Dawalji, Ayush Ravikiran Bhatambre" },
        { position: 1, grade: 8, division: "Innovatives", team: "Baby health monitoring facility", students: "Janhavi Bhaurao Yadav" },
        { position: 2, grade: 8, division: "Gems", team: "Smart Helmet / Mine Guard", students: "Aditya Anand Ganjure, Mahesh Shekher Deshmukh" },
        { position: 2, grade: 8, division: "Innovatives", team: "Agrozen", students: "Abhimanyu Sachin Deshmukh, Madhuresh Someshwar Gujrathi" },
        { position: 3, grade: 8, division: "Humbles", team: "Smart City", students: "Vedant Balaji Kakade, Viresh Umesh Rathod, Vighnesh Umesh Rathod" },

        // ===== GRADE 9 =====
        { position: 1, grade: 9, division: "Champians", team: "Aeroplane crash safety system", students: "Samarth Prashant Bhad, Advay Pramod Tike, Chaitanya Deepak Dadge" },
        { position: 2, grade: 9, division: "Enthuziasts", team: "Street electricity plant", students: "Aditya Ashok Sawant, Tanmay Anil Salve, Viren Manish Mudkanna" },
        { position: 3, grade: 9, division: "Diligents", team: "Study Bot AI", students: "Kshitij Sanjay Autade, Avanish Ravi Rajurkar" },

        // ===== GRADE 10 =====
        { position: 1, grade: 10, division: "Innovatives", team: "Anti-Accident Device", students: "Belure Yash Chandrashekhar, Jadhav Chaitanya Anil, Sajjan Rudraraj Ramesh" },
        { position: 2, grade: 10, division: "Innovatives", team: "Seed to success: A Comprehensive Project", students: "Anushka Shrikant Gilda, Kadam Eshwari Ganesh" },
        { position: 3, grade: 10, division: "Brilliants", team: "Fruit Health Monitoring System", students: "Shruti Ramesh Solapure, Abhidnya Ajay Bansode" },
    ];

    useEffect(() => {
        // Duplicate data for seamless scrolling
        const duplicated = [...lastYearData, ...lastYearData, ...lastYearData, ...lastYearData];
        setResults(duplicated);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        
        if (!container || !content || results.length === 0) return;

        let position = 0;
        let isPaused = false;

        const animate = () => {
            if (!isPaused && content) {
                position += scrollSpeed;
                
                // Reset position when content has scrolled enough
                if (position >= content.scrollHeight / 3) {
                    position = 0;
                }
                
                content.style.transform = `translateY(-${position}px)`;
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        // Pause on hover
        const handleMouseEnter = () => { isPaused = true; };
        const handleMouseLeave = () => { isPaused = false; };

        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [results]);

    const getMedal = (position) => {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[position - 1] || '🏅';
    };

    const getMedalColor = (position) => {
        const colors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
        return colors[position - 1] || 'text-blue-500';
    };

    return (
        <div 
            ref={containerRef}
            className="bg-gradient-to-r from-blue-950/95 via-blue-900/95 to-blue-800/95 rounded-xl border-2 border-yellow-400/50 overflow-hidden relative shadow-2xl h-full"
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-blue-900/95 px-3 py-2 text-center border-b border-yellow-400/30">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">🏆</span>
                    <span className="text-yellow-400 font-bold text-xs md:text-sm uppercase tracking-wider">
                        Spark 3.0 Winners 2025-26
                    </span>
                    <span className="text-lg">🏆</span>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="pt-10 pb-3 overflow-hidden h-[420px] relative">
                <div 
                    ref={contentRef}
                    className="flex flex-col"
                    style={{ willChange: 'transform' }}
                >
                    {results.map((result, index) => (
                        <div 
                            key={index}
                            className={`flex items-center px-3 py-2 border-b border-blue-700/20 flex-shrink-0 ${
                                result.position === 1 ? 'bg-yellow-500/5' : ''
                            }`}
                        >
                            <span className={`text-lg flex-shrink-0 mr-2 ${getMedalColor(result.position)}`}>
                                {getMedal(result.position)}
                            </span>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-white font-semibold text-xs">
                                        {result.team}
                                    </span>
                                </div>
                                <div className="text-blue-300 text-xs truncate">
                                    {result.students}
                                </div>
                            </div>

                            <div className="flex-shrink-0 ml-2">
                                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-400/30">
                                    G{result.grade}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-blue-950 to-transparent"></div>
        </div>
    );
};

export default HeroBanner;