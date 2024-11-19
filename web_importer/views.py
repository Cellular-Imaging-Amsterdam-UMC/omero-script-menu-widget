#!/usr/bin/env python
# -*- coding: utf-8 -*-
from omeroweb.webclient.decorators import login_required, render_response
import logging
import jwt
import time
import os
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.conf import settings

logger = logging.getLogger(__name__)

# Configure base directory to point to the mounted L-Drive
BASE_DIR = '/L-Drive'

logger.info("\n=== Directory Access Check ===")
logger.info(f"Checking directory structure and permissions:")
logger.info(f"L-Drive directory: {BASE_DIR}")
logger.info(f"   - Exists: {os.path.exists(BASE_DIR)}")
logger.info(f"   - Readable: {os.access(BASE_DIR, os.R_OK) if os.path.exists(BASE_DIR) else 'N/A'}")
logger.info(f"   - Executable: {os.access(BASE_DIR, os.X_OK) if os.path.exists(BASE_DIR) else 'N/A'}")

def check_directory_access(path):
    """Check if a directory exists and is accessible."""
    try:
        exists = os.path.exists(path)
        readable = os.access(path, os.R_OK) if exists else False
        executable = os.access(path, os.X_OK) if exists else False
        
        if not exists:
            return False, f"Directory does not exist: {path}"
        if not readable:
            return False, f"Directory is not readable: {path}"
        if not executable:
            return False, f"Directory is not executable (searchable): {path}"
            
        return True, "Directory is accessible"
    except Exception as e:
        return False, f"Error checking directory access: {str(e)}"

@login_required()
@render_response()
def server_side_browser(request, conn=None, **kwargs):
    """ Render the server-side browser. """
    current_user = conn.getUser()
    username = current_user.getName()
    user_id = current_user.getId()
    is_admin = conn.isAdmin()
    
    context = {
        'template': 'webimporter/webclient_plugins/server_side_browser.html',
        'user_name': username,
        'user_id': user_id,
        'is_admin': is_admin,
        'base_dir': os.path.basename(BASE_DIR)
    }
    return context

@login_required()
@require_http_methods(["GET"])
def list_directory(request, conn=None, **kwargs):
    logger.info("\n=== list_directory called ===")
    logger.info(f"Request URL: {request.build_absolute_uri()}")
    logger.info(f"Request path: {request.path}")
    logger.info(f"Request GET params: {request.GET}")
    
    # Check access to L-Drive
    can_access, message = check_directory_access(BASE_DIR)
    if not can_access:
        logger.error(f"L-Drive access check failed: {message}")
        return JsonResponse({'error': message}, status=403)
    
    current_path = request.GET.get('path', '')
    abs_current_path = os.path.abspath(os.path.join(BASE_DIR, current_path))
    
    logger.info(f"Checking access to requested path: {abs_current_path}")
    can_access, message = check_directory_access(abs_current_path)
    if not can_access:
        logger.error(f"Target directory access check failed: {message}")
        return JsonResponse({'error': message}, status=403)
    
    if not abs_current_path.startswith(BASE_DIR):
        logger.warning(f"Access denied - path {abs_current_path} not within {BASE_DIR}")
        return JsonResponse({'error': 'Access denied - path outside of allowed directory'}, status=403)

    try:
        items = os.listdir(abs_current_path)
        logger.info(f"Successfully listed directory: {abs_current_path}")
        logger.info(f"Found {len(items)} items")
        
        dirs = []
        files = []
        for item in items:
            item_path = os.path.join(abs_current_path, item)
            rel_item_path = os.path.relpath(item_path, BASE_DIR)
            if os.path.isdir(item_path):
                dirs.append({'name': item, 'path': rel_item_path})
            else:
                files.append({'name': item, 'path': rel_item_path})

        return JsonResponse({
            'current_path': current_path,
            'dirs': dirs,
            'files': files
        })
    except OSError as e:
        logger.error(f"Failed to list directory {abs_current_path}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@login_required()
@require_http_methods(["GET"])
def file_info(request, conn=None, **kwargs):
    file_path = request.GET.get('path', '')
    abs_file_path = os.path.abspath(os.path.join(BASE_DIR, file_path))

    if not abs_file_path.startswith(BASE_DIR):
        return JsonResponse({'error': 'Access denied'}, status=403)

    try:
        size = os.path.getsize(abs_file_path)
        modified_time = time.ctime(os.path.getmtime(abs_file_path))
        return JsonResponse({
            'size': f'{size} bytes',
            'modified': modified_time
        })
    except OSError as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required()
@require_http_methods(["POST"])
def import_selected(request, conn=None, **kwargs):
    try:
        import json
        data = json.loads(request.body)
        selected_items = data.get('selected', [])
        
        if not selected_items:
            return JsonResponse({'error': 'No items selected'}, status=400)
        
        # Get the current user's information for logging
        current_user = conn.getUser()
        username = current_user.getName()
        user_id = current_user.getId()
        
        # Log the import attempt
        logger.info(f"User {username} (ID: {user_id}) attempting to import {len(selected_items)} items")
        
        for item in selected_items:
            abs_path = os.path.abspath(os.path.join(BASE_DIR, item))
            if not abs_path.startswith(BASE_DIR):
                return JsonResponse({'error': 'Access denied'}, status=403)
            logger.info(f"Importing: {abs_path}")
            # Add your actual import logic here
        
        return JsonResponse({
            'status': 'success',
            'message': f'Successfully queued {len(selected_items)} items for import'
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Import error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)