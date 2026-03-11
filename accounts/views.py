from django.shortcuts import render, redirect   
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required

# Create your views here.

def registerAccount(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('accounts:login')
    if request.method == "GET":
        form = CustomUserCreationForm()
    return render(request, "accounts/register.html", {"form": form})

@login_required
def profile(request):
    return render(request, "accounts/profile.html")