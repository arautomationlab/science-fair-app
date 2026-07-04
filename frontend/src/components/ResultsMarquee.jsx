import React, { useState, useEffect } from 'react';

const ResultsMarquee = () => {
    const [results, setResults] = useState([]);
    const [isPaused, setIsPaused] = useState(false);

    // Last year's winners data from your Excel sheet
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
        // Double the data for seamless scrolling
        setResults([...lastYearData, ...lastYearData, ...lastYearData]);
    }, []);

    // Get medal emoji
    const getMedal = (position) => {
        const medals = ['🥇', '🥈', '🥉'];
        return medals[position - 1] || '🏅';
    };

    // Get medal color
    const getMedalColor = (position) => {
        const colors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
        return colors[position - 1] || 'text-blue-500';
    };

    // Get position text
    const getPositionText = (position) => {
        if (position === 1) return '🏆 Winner';
        if (position === 2) return '🥈 Runner-up';
        if (position === 3) return '🥉 Second Runner-up';
        return '';
    };

    return (
        <div 
            className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 border-y-4 border-yellow-400 overflow-hidden relative shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-blue-900/95 px-4 py-2.5 text-center border-b border-yellow-400/30">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <span className="text-2xl">🏆</span>
                    <span className="text-yellow-400 font-bold text-sm md:text-lg uppercase tracking-wider">
                        Spark 3.0 - Last Year's Science Fair Winners 2025-26
                    </span>
                    <span className="text-2xl">🏆</span>
                </div>
            </div>

            {/* Marquee Container */}
            <div className="pt-14 pb-4 overflow-hidden h-[400px] relative">
                <div 
                    className={`absolute inset-0 flex flex-col ${!isPaused ? 'animate-marquee-vertical' : ''}`}
                    style={{
                        animationDuration: '60s',
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                    }}
                >
                    {results.map((result, index) => (
                        <div 
                            key={index}
                            className={`flex items-center px-4 md:px-8 py-2.5 border-b border-blue-700/30 hover:bg-blue-800/30 transition-colors flex-shrink-0 ${
                                result.position === 1 ? 'bg-yellow-500/10' : ''
                            }`}
                        >
                            {/* Medal and Position */}
                            <div className="flex items-center gap-3 w-32 flex-shrink-0">
                                <span className={`text-2xl ${getMedalColor(result.position)}`}>
                                    {getMedal(result.position)}
                                </span>
                                <span className="text-xs text-blue-300 font-medium hidden sm:inline">
                                    {getPositionText(result.position)}
                                </span>
                            </div>

                            {/* Project Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-white font-semibold text-sm md:text-base">
                                        {result.team}
                                    </span>
                                    <span className="text-blue-300 text-xs md:text-sm hidden sm:inline">
                                        ({result.division})
                                    </span>
                                </div>
                                <div className="text-blue-300 text-xs md:text-sm truncate">
                                    {result.students}
                                </div>
                            </div>

                            {/* Grade Badge */}
                            <div className="flex-shrink-0 ml-4">
                                <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400/30">
                                    Grade {result.grade}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-950 to-transparent"></div>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes marquee-vertical {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-33.33%); }
                }
                .animate-marquee-vertical {
                    animation: marquee-vertical 60s linear infinite;
                }
                .animate-marquee-vertical:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default ResultsMarquee;