# simple-pipe-game
This is a very loosely put together KnockoutJS based pipe-flow game that has been peiced back together via a deployed webapp.  The original project with complete csproj is currently unavailable, but all game related typescript has been committed to this repo.

The purpose of this was to do a pipe flow game, which I'd been wanting to do for a while and experiment with a slightly different way of doing KnockoutJS components.

# Where can I play?
The app is currently hosted in Azure here at https://knockout-pipe-game.azurewebsites.net.  You can either hit "Start game with headstart" or pick a game board size that you like better, hit "generate a new game" and then hit "Start game with headstart".  

# How do I play?
After you start the game, your goal is to rotate pipes (by clicking on them) so that the flow goes from the green side of the starting tile to the red side of the ending tile.

# Where is the code?
The majority of the interesting bits is available under [/src/components/pipe-game](https://github.com/allenrice/simple-pipe-game/tree/master/src/components/pipe-game)

# Where are the tests?
You can run the tests in your browser [here](https://knockout-pipe-game.azurewebsites.net/src/test/) or view them in source code here: [/src/test/app](https://github.com/allenrice/simple-pipe-game/tree/master/src/test/app)
