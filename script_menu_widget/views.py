#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.shortcuts import render
from omeroweb.webclient.decorators import login_required, render_response
from omero.rtypes import unwrap
import logging

logger = logging.getLogger(__name__)

@login_required()
@render_response()
def webclient_templates(request, base_template, **kwargs):
    """ Simply return the named template. Similar functionality to
    django.views.generic.simple.direct_to_template """
    template_name = 'scriptmenu/webgateway/%s.html' % base_template
    return {'template': template_name}

@login_required()
@render_response()
def get_script_menu(request, conn=None, **kwargs):
    script_menu_data = []
    error_logs = []

    for folder in script_folders:
        folder_data = {'name': folder.name, 'ul': []}
        for script in folder.scripts:
            script_data = {
                'id': script.id,
                'name': script.name,
                'description': script_info
            }
            try:
                params = conn.getScriptService().getParams(script.id)
                if params:
                    description = unwrap(params.description) if params.description else 'No description'
                    authors = f"Authors: {', '.join(params.authors)}" if params.authors else ''
                    contact = f"Contact: {params.contact}" if params.contact else ''
                    version = f"Version: {params.version}" if params.version else ''
                    institutions = f"Institutions: {', '.join(params.institutions)}" if params.institutions else ''
                    
                    script_info = f"{description}<br>{authors}<br>{contact}<br>{version}<br>{institutions}"
                    script_info = script_info.replace('<br><br>', '<br>').strip('<br>')
                    script_data['description'] = script_info
                else:
                    script_data['description'] = "No parameters found for this script."
                    error_logs.append(f"No parameters found for script {script.id}")
            except Exception as ex:
                error_message = f"Error fetching script details: {str(ex)}"
                logger.error(f"Error getting params for script {script.id}: {error_message}")
                script_data['description'] = error_message
                error_logs.append(f"Error for script {script.id}: {error_message}")
            
            folder_data['ul'].append(script_data)
        script_menu_data.append(folder_data)

    return {
        'script_menu': script_menu_data,
        'error_logs': error_logs
    }