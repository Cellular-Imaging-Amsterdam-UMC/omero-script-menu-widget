from django.urls import path
from . import views

app_name = 'webimporter'

urlpatterns = [
    # Import page URLs
    path('server_side_browser/', views.server_side_browser, name='server_side_browser'),
    path('api/list_dir/', views.list_directory, name='list_directory'),
    path('api/file_info/', views.file_info, name='file_info'),
    path('api/import_selected/', views.import_selected, name='import_selected'),
]
