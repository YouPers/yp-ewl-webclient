## image optimization

to rename files use something like this: rename 's/Act-(\d{3})-.*$/Act-$1.jpg/' *.jpg

    grunt imageopt
if you want to add new images into the project you can use the folder imagesources/tooptimize. Place your source 
images in there, then run `grunt imageopt`. The images will be optimized (compressed) and automatically copied into 
the app/assets folder. The use `git add` to add them to the repo
