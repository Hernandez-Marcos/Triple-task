from django.shortcuts import render, redirect   
from .forms import CustomUserCreationForm

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