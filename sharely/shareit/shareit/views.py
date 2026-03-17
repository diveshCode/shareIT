from django.shortcuts import render

def profile_view(request, username):
    return render(request, "profile.html", {"username": username})