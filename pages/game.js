import { useRouter } from "next/router";

function Game() {
    const router = useRouter();
    const { playerName, playerColor } = router.query;

    return (
        <div>
            <h1>Welcome to the Game Page, {playerName}!</h1>
            <h1>Your color is {playerColor}!</h1>
            {/* Rest of your game component */}
        </div>
    );
}

export default Game;
