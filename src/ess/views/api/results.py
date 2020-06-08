from collections import Counter
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Page, Participant


@view_config(route_name='api.result.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def get_item(request):
    """Handles fetching the results for a single :class:`~ess.models.page.Page`."""
    page_id = request.matchdict['pid']
    page = request.dbsession.query(Page).filter(and_(Page.id == page_id,
                                                     Page.experiment_id == request.matchdict['eid'])).first()
    if page is not None:
        responses = {}
        participants = request.dbsession.query(Participant)\
            .filter(and_(Participant.experiment_id == request.matchdict['eid'],
                         Participant.completed == True))  # noqa: E712
        for question in page.questions:
            core_type = question.question_type.inherited_attributes()['_core_type']
            if core_type in ['USEFSingleLineInput', 'USEFMultiLineInput', 'USEFHidden']:
                results = []
                for participant in participants:
                    if page_id in participant.responses:
                        if str(question.id) in participant.responses[page_id]:
                            results.append(participant.responses[page_id][str(question.id)])
                responses[str(question.id)] = Counter(results).most_common(5)
            elif core_type in ['USEFSingleChoice', 'USEFMultiChoice']:
                results = []
                for participant in participants:
                    if page_id in participant.responses:
                        if str(question.id) in participant.responses[page_id]:
                            if isinstance(participant.responses[page_id][str(question.id)], list):
                                results.extend(participant.responses[page_id][str(question.id)])
                            else:
                                results.append(participant.responses[page_id][str(question.id)])
                responses[str(question.id)] = dict(Counter(results).items())
            elif core_type in ['USEFSingleChoiceGrid', 'USEFMultiChoiceGrid']:
                responses[str(question.id)] = {}
                # TODO: This needs to be fixed to handle fixed question type values
                for row_value in question.attributes['rowValues']:
                    results = []
                    for participant in participants:
                        if page_id in participant.responses:
                            if str(question.id) in participant.responses[page_id]:
                                if row_value in participant.responses[page_id][str(question.id)]:
                                    if isinstance(participant.responses[page_id][str(question.id)][row_value], list):
                                        results.extend(participant.responses[page_id][str(question.id)][row_value])
                                    else:
                                        results.append(participant.responses[page_id][str(question.id)][row_value])
                    responses[str(question.id)][row_value] = dict(Counter(results).items())
        return {'data': {'type': 'results',
                         'id': page_id,
                         'attributes': {'responses': responses},
                         'relationships': {'page': {'data': {'type': 'pages',
                                                             'id': page_id}}}}}
    else:
        raise HTTPNotFound()
