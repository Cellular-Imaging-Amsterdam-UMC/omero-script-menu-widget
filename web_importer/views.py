#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.shortcuts import render
from omeroweb.webclient.decorators import login_required, render_response
from omero.rtypes import unwrap
import logging
from django.http import JsonResponse
from omero.gateway import BlitzGateway
from omero.api import IScriptPrx
from omero.sys import Parameters
from omero.model import OriginalFileI

logger = logging.getLogger(__name__)

@login_required()
@render_response()
def webclient_templates(request, base_template, **kwargs):
    """ Simply return the named template. Similar functionality to
    django.views.generic.simple.direct_to_template """
    template_name = 'scriptmenu/webgateway/%s.html' % base_template
    return {'template': template_name}

@login_required()
def get_script_menu(request, conn=None, **kwargs):
    script_ids = request.GET.get('script_ids', '').split(',')
    script_ids = [int(id) for id in script_ids if id.isdigit()]

    script_menu_data = []
    error_logs = []

    scriptService = conn.getScriptService()

    for script_id in script_ids:
        try:
            script = conn.getObject("OriginalFile", script_id)
            if script is None:
                error_logs.append(f"Script {script_id} not found")
                continue

            try:
                params = scriptService.getParams(script_id)
            except Exception as e:
                logger.warning(f"Exception for script {script_id}: {str(e)}")
                params = None

            if params is None:
                script_data = {
                    'id': script_id,
                    'name': script.name.replace("_", " "),
                    'description': "No description available",
                    'authors': "Unknown",
                    'version': "Unknown",
                }
            else:
                script_data = {
                    'id': script_id,
                    'name': params.name.replace("_", " "),
                    'description': unwrap(params.description) or "No description available",
                    'authors': ", ".join(params.authors) if params.authors else "Unknown",
                    'version': params.version or "Unknown",
                }

            script_menu_data.append(script_data)
        except Exception as ex:
            error_message = f"Error fetching script details for script {script_id}: {str(ex)}"
            logger.error(error_message)
            error_logs.append(error_message)

    return JsonResponse({
        'script_menu': script_menu_data,
        'error_logs': error_logs
    })