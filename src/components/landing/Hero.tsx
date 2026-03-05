import Nav from "./Nav";
import BgStars from "./BgStars";
import HeroSection from "./Section";


export default function Hero({ onLaunch } : any) {
    return (

        <div>
            <Nav onLaunch={onLaunch} />
          
            <HeroSection onLaunch={onLaunch} />

            
        </div>
    );
}