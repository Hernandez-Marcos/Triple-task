from django.shortcuts import render, redirect   
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required
from games.models import Match

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
    personal_record = request.user.score_record
    recent_matches = Match.objects.filter(user=request.user).order_by("-score")[0:20]

    context = {"personal_record": personal_record, "recent_matches": recent_matches}
    return render(request, "accounts/profile.html", context)