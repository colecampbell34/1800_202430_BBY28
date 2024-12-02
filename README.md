# CollectiveCoin

## 1. Project Description
Our team, BBY-28, is developing a web application to help young adult communities become confident in their finances, by allowing easy collaboration and visualization of shared financial goals and individual contributions.

## 2. Names of Contributors
List team members and/or short bio's here... 
* Hi my name is Cole! I am excited to start this project.
* Hi, my name is Clinton! Let's start the show!
* Hi, my name is Jessie/Lin! Let's start our project and have fun.

## 3. Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)
* Node.js v20.17.0 (served live in the browser)
* GitHub (set up a remote repository and allow team members to push and pull changes to code.)


## 4. Complete setup/installation/usage
State what a user needs to do when they come to your project.  How do others start using your code or application?
Here are the steps ...
* Browse landing page for more info about our app
* Log in/sign up
* Create a new group budget sheet
* Share the join code with your friends
* Add contributions 
* Add allocations for the money so people can see where it's going
* Edit deadline/group name
* View all of your groups on the groups page
* View all of your groups progress bars on the home page
* Keep track of your own finances with the personal expenses page
* Change font size
* Log out/delete account

## 5. Known Bugs and Limitations
Here are some known bugs:
* Some errors occur (rarely) when deleting account and subsequent user data in firestore
* Some cards may not fit on all screens when increasing font size to the max
* ...

## 6. Features for Future
What we'd like to build in the future:
* Custom split goal feature so people can take on more/less of budget
* Chat feature within group
* Reaction features so friends can react to eachothers savings
	
## 7. Contents of Folder
Content of the project folder:

Top level of project folder: 
├── .gitignore               # Git ignore file
├── server.js                # node driven json file
├── public
    ├── index.html               # landing HTML file, this is what users see when you come to url
    ├── login.html               # login page
    ├── main.html                # main page
    ├── expenses.html            # personal expenses page
    ├── new.html                 # add new group page
    ├── groups.html              # group page showing the existing groups for specific user.
    ├── budgetsheet.html         # budgetsheet showing details for each group
    ├── settings.html            # settings for font size and account settings.
    ├── 404.html                 # error pages
├── .firebaserc              
├── firebase.json
└── README.md

Public has the following subfolders and files:
├── images                   # Folder for images
    /cointree_BW.jpg         # logo of our app
    /join-code.png           # img for the index page
    /line.svg                # img for the index page
    /make-changes.png        # img for the index page
    /my-groups.png           # img for the index page 
    /progress-all-groups.png # img for the index page
    /timeline.png            # img for the index page

├── scripts                  # Folder for scripts
    /authentication.js       # Initialize the FirebaseUI Widget using Firebase.
    /expenses.js             # Initialize and calculate personal expenses.
    /firebaseAPI_BBY28.js    # Your web app's Firebase configuration
    /font.js                 # setting page font related functions
    /groupdata.js            # budgetsheet related functions
    /groupspage.js           # grouppage related functions for add group and group managment
    /logout.js               # setting page account related functions
    /main.js                 # main page related functions, such as progress bar functions.
    /newgroup.js             # new page related functions
    /skeleton-before-login.js# skeleton file for before login
    /skeleton.js             # skeleton file for after login

├── styles                   # Folder for styles
    /budgetsheet.css         # budgetsheet styles
    /colorforpages.css       # color related settings
    /filling.css             # nav bar settings
    /index.css               # index page styles
    /style.css               # main design settings

├── skeleton
    /header-before-login.html # headers before login
    /header.html              # headers after login
    /navbar.html              # navbar after login


