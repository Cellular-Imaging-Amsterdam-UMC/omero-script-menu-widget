#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.shortcuts import render
from omeroweb.webclient.decorators import login_required, render_response

@login_required()
@render_response()
def webclient_templates(request, base_template, **kwargs):
    """ Simply return the named template. Similar functionality to
    django.views.generic.simple.direct_to_template """
    template_name = 'webtest/webgateway/%s.html' % base_template
    return {'template': template_name}